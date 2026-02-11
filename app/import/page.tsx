'use client';

import { useRef, useState } from 'react';

export default function ImportPage() {
  const [folderPath, setFolderPath] = useState('');
  const [status, setStatus] = useState('Idle');
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  const startImport = () => {
    workerRef.current?.terminate();
    const worker = new Worker('/ingest-worker.js');
    workerRef.current = worker;
    worker.onmessage = (event) => {
      const { type, value, message, data } = event.data;
      setProgress(value ?? 0);
      if (type === 'progress') setStatus(message);
      if (type === 'done') {
        setStatus(`Imported ${data.docs ?? 0} docs into ${data.clusters ?? 0} buildings.`);
        worker.terminate();
      }
    };
    worker.postMessage({ folderPath });
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Import Documents</h1>
      <p className="text-sm text-slate-300">Select a local folder path containing PDF/TXT/JSON files. Parsing runs locally and stores metadata in SQLite.</p>
      <div className="panel p-4 space-y-3">
        <input value={folderPath} onChange={(e) => setFolderPath(e.target.value)} placeholder="/absolute/path/to/documents" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2" />
        <div className="h-2 rounded bg-slate-800 overflow-hidden"><div className="h-full bg-cyan-500" style={{ width: `${progress}%` }} /></div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-cyan-600" onClick={startImport}>Import Folder</button>
          <button
            className="px-3 py-2 rounded bg-slate-700"
            onClick={async () => {
              setStatus('Generating seed dataset...');
              const data = await (await fetch('/api/seed', { method: 'POST' })).json();
              setProgress(100);
              setStatus(`Seeded ${data.docs} docs from ${data.folder}`);
            }}
          >Use Seed Dataset</button>
        </div>
      </div>
      <p className="text-cyan-300">{status}</p>
    </section>
  );
}
