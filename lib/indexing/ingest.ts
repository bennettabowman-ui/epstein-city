import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pdfParse from 'pdf-parse';
import db from '@/lib/db/client';
import { extractEntities } from './entities';
import { clusterDocs } from './cluster';
import { buildCityLayout } from './layout';

const STOP = new Set(['the', 'a', 'and', 'of', 'to', 'in', 'for', 'on', 'with', 'is', 'at']);

interface ParsedDoc {
  filename: string;
  mimeType: string;
  pages: string[];
  hash: string;
}

export async function ingestFolder(folderPath: string) {
  const files = fs.readdirSync(folderPath).filter((f) => /\.(pdf|txt|json)$/i.test(f));
  const parsed: ParsedDoc[] = [];
  for (const f of files) parsed.push(await parseFile(path.join(folderPath, f)));

  const inserted: { docId: number; entities: string[]; keywords: string[] }[] = [];
  const insertDoc = db.prepare(`INSERT INTO documents(filename, imported_at, source_hash, mime_type) VALUES (?, ?, ?, ?)`);
  const insertChunk = db.prepare(`INSERT INTO chunks(doc_id, page_number, extracted_text) VALUES (?, ?, ?)`);
  const insertEntity = db.prepare(`INSERT INTO entities(doc_id, chunk_id, type, value, is_private) VALUES (?, ?, ?, ?, ?)`);

  const tx = db.transaction(() => {
    db.exec('DELETE FROM building_docs; DELETE FROM buildings; DELETE FROM relationships;');
    for (const doc of parsed) {
      const docRes = insertDoc.run(doc.filename, new Date().toISOString(), doc.hash, doc.mimeType);
      const docId = Number(docRes.lastInsertRowid);
      const entityList: string[] = [];
      const allText = doc.pages.join('\n');

      doc.pages.forEach((pageText, idx) => {
        const chunkRes = insertChunk.run(docId, idx + 1, pageText);
        const chunkId = Number(chunkRes.lastInsertRowid);
        extractEntities(pageText).forEach((entity) => {
          insertEntity.run(docId, chunkId, entity.type, entity.value, entity.isPrivate ? 1 : 0);
          if (entity.type !== 'date') entityList.push(entity.value);
        });
      });

      inserted.push({ docId, entities: uniq(entityList), keywords: topKeywords(allText) });
    }
  });
  tx();

  const clusters = clusterDocs(inserted);
  const layout = buildCityLayout(clusters);
  const insertBuilding = db.prepare(`INSERT INTO buildings(id,label,neighborhood,grid_x,grid_y,size) VALUES (?,?,?,?,?,?)`);
  const mapDoc = db.prepare(`INSERT OR IGNORE INTO building_docs(building_id,doc_id) VALUES (?,?)`);
  const rel = db.prepare(`INSERT OR REPLACE INTO relationships(source_building,target_building,weight) VALUES (?,?,?)`);

  const mapTx = db.transaction(() => {
    for (const c of clusters) {
      const slot = layout.find((l) => l.clusterId === c.id)!;
      insertBuilding.run(c.id, c.label, slot.neighborhood, slot.x, slot.y, slot.size);
      c.docIds.forEach((docId) => mapDoc.run(c.id, docId));
    }

    for (const a of clusters) {
      for (const b of clusters) {
        if (a.id >= b.id) continue;
        const shared = overlap(a.docIds, b.docIds);
        if (shared > 0) {
          rel.run(a.id, b.id, shared);
          rel.run(b.id, a.id, shared);
        }
      }
    }
  });
  mapTx();

  return { docs: inserted.length, clusters: clusters.length };
}

async function parseFile(filePath: string): Promise<ParsedDoc> {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') {
    const parsed = await pdfParse(buffer);
    const pages = parsed.text.split(/\f+/).map((s) => s.trim()).filter(Boolean);
    return { filename: path.basename(filePath), mimeType: 'application/pdf', pages: pages.length ? pages : [parsed.text], hash: hash(buffer) };
  }
  if (ext === '.json') {
    const data = JSON.parse(buffer.toString('utf8'));
    const text = JSON.stringify(data, null, 2);
    return { filename: path.basename(filePath), mimeType: 'application/json', pages: [text], hash: hash(buffer) };
  }
  return { filename: path.basename(filePath), mimeType: 'text/plain', pages: [buffer.toString('utf8')], hash: hash(buffer) };
}

function hash(input: Buffer) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function topKeywords(text: string) {
  const counts = new Map<string, number>();
  const words = text.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  for (const w of words) {
    if (STOP.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([k]) => k);
}

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

function overlap(a: number[], b: number[]) {
  const set = new Set(a);
  let count = 0;
  for (const i of b) if (set.has(i)) count += 1;
  return count;
}
