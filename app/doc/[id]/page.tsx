import { SafeModeToggle } from '@/components/safe-mode-toggle';

async function getData(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/doc/${id}`, { cache: 'no-store' });
  return res.json();
}

export default async function DocPage({ params }: { params: { id: string } }) {
  const { doc, chunks, entities } = await getData(params.id);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Document Viewer: {doc?.filename}</h1>
        <SafeModeToggle />
      </div>
      <div className="panel p-4 text-sm space-y-1">
        <p>Source filename: {doc?.filename}</p>
        <p>Import date: {doc?.imported_at}</p>
        <p>SHA-256: {doc?.source_hash}</p>
      </div>
      <div className="space-y-3">
        {chunks.map((c: any) => (
          <article key={c.id} className="panel p-4">
            <h3 className="font-semibold">Page {c.page_number}</h3>
            <p className="mt-2 whitespace-pre-wrap text-slate-200">{c.display_text}</p>
            <p className="text-xs text-slate-400 mt-2">Extracted from document: page {c.page_number}, chunk #{c.id}</p>
          </article>
        ))}
      </div>
      <div className="panel p-4">
        <h2 className="font-semibold mb-2">Entities (highlight toggles can be layered here)</h2>
        <div className="flex flex-wrap gap-2 text-xs">{entities.map((e: any) => <span key={e.id} className="px-2 py-1 rounded bg-slate-800">{e.type}:{e.value}</span>)}</div>
      </div>
    </section>
  );
}
