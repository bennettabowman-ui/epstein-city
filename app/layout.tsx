import './globals.css';
import Link from 'next/link';
import { Providers } from '@/components/providers';

export const metadata = {
  title: 'Epstein Files City',
  description: 'Local-first document navigation city with safe redaction defaults.'
};

const nav = [
  ['Import', '/import'],
  ['City', '/city'],
  ['Search', '/search']
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-50">
            <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-5">
              <Link href="/" className="font-semibold text-cyan-400">Epstein City</Link>
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="text-sm text-slate-300 hover:text-white">{label}</Link>
              ))}
            </nav>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
