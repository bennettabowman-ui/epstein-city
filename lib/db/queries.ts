import db from './client';
import { redactText } from '@/lib/utils/redaction';

export function getSafeMode() {
  return db.prepare(`SELECT value FROM app_settings WHERE key='safe_mode'`).get() as { value: string };
}

export function setSafeMode(enabled: boolean) {
  db.prepare(`UPDATE app_settings SET value=? WHERE key='safe_mode'`).run(enabled ? '1' : '0');
}

export function getCityBuildings() {
  return db.prepare(`
    SELECT b.*, COUNT(DISTINCT bd.doc_id) as doc_count,
    GROUP_CONCAT(DISTINCT e.value) as entities
    FROM buildings b
    LEFT JOIN building_docs bd ON bd.building_id = b.id
    LEFT JOIN entities e ON e.doc_id = bd.doc_id AND e.type != 'date'
    GROUP BY b.id
    ORDER BY b.id
  `).all();
}

export function getBuilding(id: number) {
  const b = db.prepare(`SELECT * FROM buildings WHERE id=?`).get(id);
  const docs = db.prepare(`
    SELECT d.id, d.filename, d.imported_at, d.source_hash, d.mime_type
    FROM documents d JOIN building_docs bd ON bd.doc_id=d.id
    WHERE bd.building_id=? ORDER BY d.filename
  `).all(id);
  const entities = db.prepare(`
    SELECT type, value, COUNT(*) as count, MAX(is_private) as is_private
    FROM entities WHERE doc_id IN (SELECT doc_id FROM building_docs WHERE building_id=?)
    GROUP BY type, value ORDER BY count DESC
  `).all(id);
  const timeline = db.prepare(`
    SELECT value, COUNT(*) as count FROM entities
    WHERE type='date' AND doc_id IN (SELECT doc_id FROM building_docs WHERE building_id=?)
    GROUP BY value ORDER BY value
  `).all(id);
  const connections = db.prepare(`SELECT target_building, weight FROM relationships WHERE source_building=? ORDER BY weight DESC`).all(id);
  return { building: b, docs, entities, timeline, connections };
}

export function getDocument(id: number, safeMode = true) {
  const doc = db.prepare(`SELECT * FROM documents WHERE id=?`).get(id) as any;
  const chunks = db.prepare(`SELECT id,page_number,extracted_text FROM chunks WHERE doc_id=? ORDER BY page_number`).all(id) as any[];
  const entities = db.prepare(`SELECT * FROM entities WHERE doc_id=?`).all(id) as any[];
  const privateNames = entities.filter((e) => e.type === 'person' && e.is_private).map((e) => e.value);
  return {
    doc,
    chunks: chunks.map((c) => ({ ...c, display_text: redactText(c.extracted_text, safeMode, privateNames) })),
    entities
  };
}

export function search(query: string) {
  const q = query.trim();
  if (!q) return [];
  return db.prepare(`
    SELECT d.id as doc_id, d.filename, c.page_number, snippet(chunks_fts, 0, '[', ']', '…', 20) as match_snippet,
    b.id as building_id, b.label as building_label
    FROM chunks_fts
    JOIN chunks c ON c.id = chunks_fts.rowid
    JOIN documents d ON d.id = c.doc_id
    LEFT JOIN building_docs bd ON bd.doc_id = d.id
    LEFT JOIN buildings b ON b.id = bd.building_id
    WHERE chunks_fts MATCH ?
    ORDER BY rank
    LIMIT 50
  `).all(q);
}

export function exportReadingList(docIds: number[]) {
  const rows = db.prepare(`SELECT id, filename, imported_at, source_hash FROM documents WHERE id IN (${docIds.map(() => '?').join(',')})`).all(...docIds);
  return rows;
}
