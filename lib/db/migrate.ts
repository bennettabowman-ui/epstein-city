import db from './client';

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      imported_at TEXT NOT NULL,
      source_hash TEXT NOT NULL,
      mime_type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id INTEGER NOT NULL,
      page_number INTEGER NOT NULL,
      extracted_text TEXT NOT NULL,
      FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
      extracted_text,
      content='chunks',
      content_rowid='id'
    );

    CREATE TABLE IF NOT EXISTS entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id INTEGER NOT NULL,
      chunk_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      is_private INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY (chunk_id) REFERENCES chunks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS buildings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      neighborhood TEXT NOT NULL,
      grid_x INTEGER NOT NULL,
      grid_y INTEGER NOT NULL,
      size INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS building_docs (
      building_id INTEGER NOT NULL,
      doc_id INTEGER NOT NULL,
      PRIMARY KEY (building_id, doc_id),
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
      FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS relationships (
      source_building INTEGER NOT NULL,
      target_building INTEGER NOT NULL,
      weight REAL NOT NULL,
      PRIMARY KEY (source_building, target_building)
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id INTEGER,
      building_id INTEGER,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_id INTEGER,
      building_id INTEGER,
      chunk_id INTEGER,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TRIGGER IF NOT EXISTS chunks_ai AFTER INSERT ON chunks BEGIN
      INSERT INTO chunks_fts(rowid, extracted_text) VALUES (new.id, new.extracted_text);
    END;

    CREATE TRIGGER IF NOT EXISTS chunks_ad AFTER DELETE ON chunks BEGIN
      INSERT INTO chunks_fts(chunks_fts, rowid, extracted_text) VALUES('delete', old.id, old.extracted_text);
    END;

    CREATE TRIGGER IF NOT EXISTS chunks_au AFTER UPDATE ON chunks BEGIN
      INSERT INTO chunks_fts(chunks_fts, rowid, extracted_text) VALUES('delete', old.id, old.extracted_text);
      INSERT INTO chunks_fts(rowid, extracted_text) VALUES (new.id, new.extracted_text);
    END;
  `);

  db.prepare(`INSERT OR IGNORE INTO app_settings(key, value) VALUES ('safe_mode', '1')`).run();
}
