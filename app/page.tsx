import Link from 'next/link';

export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Epstein Files City (Local First)</h1>
      <p className="text-slate-300 max-w-3xl">
        Navigate public documents as a city. Safe Mode redacts PII by default and every summary snippet includes provenance citations.
      </p>
      <div className="flex gap-3">
        <Link href="/import" className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500">Import Documents</Link>
        <Link href="/city" className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600">Enter City</Link>
      </div>
    </section>
  );
}
