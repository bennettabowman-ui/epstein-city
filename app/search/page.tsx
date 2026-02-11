'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Global Search</h1>
      <div className="panel p-4 flex gap-2">
        <input className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search full text + entities" />
        <button className="px-3 py-2 rounded bg-cyan-600" onClick={async () => setRows(await (await fetch(`/api/search?q=${encodeURIComponent(q)}`)).json())}>Search</button>
      </div>
      <ul className="space-y-2">
        {rows.map((r, idx) => (
          <li key={idx} className="panel p-3 text-sm space-y-1">
            <p className="font-semibold">{r.filename} (page {r.page_number})</p>
            <p className="text-slate-300" dangerouslySetInnerHTML={{ __html: r.match_snippet }} />
            <div className="flex gap-2">
              <Link href={`/doc/${r.doc_id}`} className="text-cyan-300">Open document</Link>
              {r.building_id && <Link href={`/city#building-${r.building_id}`} className="text-cyan-300">Take me there (building {r.building_id})</Link>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
