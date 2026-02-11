# Epstein Files City (MVP, Local-First)

A local-first Next.js app for organizing and navigating legally obtained public documents as a city metaphor.

## Stack
- Next.js App Router + React + TypeScript strict mode
- Tailwind CSS
- Isometric 2D city canvas fallback (performance-safe alternative to full 3D)
- SQLite (`better-sqlite3`) with FTS5
- Local ingestion pipeline for PDF/TXT/JSON

## Safety + Compliance
- **Safe Mode ON by default** (stored in SQLite settings).
- Redacts emails, phone numbers, SSNs, bank-like account numbers, street addresses, and private-individual names in display layer.
- Provenance shown in document/building views: filename, import date, source hash, page/chunk citation.
- Neutral summaries/snippets only; all snippets include extraction citation text.
- No person lookup endpoint for hidden PII, no unredacted bulk export.

## Setup
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands
```bash
npm run dev
npm run build
npm run test
npm run seed
```

## Pages
- `/import`: local folder import + progress UI + seed loader
- `/city`: city exploration map with WASD/arrow driving + minimap card
- `/building/[id]`: building interior with documents/entities/timeline/connections + relationship graph
- `/doc/[id]`: document viewer with redacted text and citations
- `/search`: global full-text search and jump-to-building links

## Indexing Pipeline
1. Ingest documents from a folder (`.pdf`, `.txt`, `.json`).
2. Chunk text by page (PDF page-split fallback) or single chunk for text/json.
3. Extract entities via regex + heuristics (`person/org/location/date`).
4. Build lightweight doc features (keywords/entity lists).
5. Cluster documents deterministically by top keyword theme.
6. Generate city grid layout:
   - Neighborhoods by top-level theme
   - Building size by document count
   - Grid placement avoids overlap via deterministic slot assignment

## Clustering Details
- Current MVP clustering is deterministic and simple.
- Theme = highest-frequency keyword in a document.
- Cluster label = top 3 entities + top keyword.
- Relationship edges can be extended to stronger entity-overlap metrics.

## Adding New Parsers
- Extend `parseFile` in `lib/indexing/ingest.ts`.
- Return `{ filename, mimeType, pages[], hash }`.
- Keep extracted text and per-page references for provenance.

## Safe Mode Redaction
- Implemented in `lib/utils/redaction.ts`.
- Applied in query layer (`getDocument`) so storage remains original but UI is redacted by default.
- Safe mode toggle endpoint: `/api/toggle-safe`.

## PDF Parsing Troubleshooting
- Some PDFs do not preserve page breaks consistently in extracted text.
- Current parser uses `pdf-parse` and splits on form-feed fallback.
- If pages collapse into one text block, the citation still references chunk/page 1.
- For scanned/image PDFs, add OCR parser module later (e.g., Tesseract pipeline) in `parseFile`.

## Notes on Local-First Operation
- Database stored at `.data/epstein-city.db`.
- Seed dataset path: `.data/seed`.
- No cloud calls or user accounts.
