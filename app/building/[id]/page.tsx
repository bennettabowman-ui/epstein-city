import Link from 'next/link';
import { RelationshipGraph } from '@/components/relationship-graph';

async function getData(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/building/${id}`, { cache: 'no-store' });
  return res.json();
}

export default async function BuildingPage({ params }: { params: { id: string } }) {
  const data = await getData(params.id);
  const { building, docs, entities, timeline, connections } = data;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Shop Interior: {building?.label ?? 'Unknown building'}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="panel p-4">
          <h2 className="font-semibold mb-2">Documents</h2>
          <ul className="space-y-2 text-sm">
            {docs.map((d: any) => (
              <li key={d.id} className="flex justify-between gap-2">
                <Link className="text-cyan-300 hover:underline" href={`/doc/${d.id}`}>{d.filename}</Link>
                <span className="text-slate-400">hash {d.source_hash.slice(0, 8)}…</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-4">
          <h2 className="font-semibold mb-2">Entities</h2>
          <div className="flex flex-wrap gap-2">
            {entities.slice(0, 20).map((e: any) => <span key={e.type + e.value} className="px-2 py-1 rounded bg-slate-800 text-xs">{e.type}: {e.value} ({e.count})</span>)}
          </div>
        </div>
        <div className="panel p-4">
          <h2 className="font-semibold mb-2">Timeline</h2>
          <ul className="text-sm space-y-1">{timeline.map((t: any) => <li key={t.value}>{t.value} ({t.count})</li>)}</ul>
        </div>
        <div className="panel p-4">
          <h2 className="font-semibold mb-2">Connections</h2>
          <ul className="text-sm">{connections.map((c: any) => <li key={c.target_building}>Building #{c.target_building} score {Number(c.weight).toFixed(2)}</li>)}</ul>
        </div>
      </div>
      <RelationshipGraph entities={entities} />
    </section>
  );
}
