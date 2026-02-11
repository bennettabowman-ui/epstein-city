'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Building = { id: number; label: string; neighborhood: string; grid_x: number; grid_y: number; doc_count: number; entities: string };

export function CityCanvas({ buildings }: { buildings: Building[] }) {
  const [car, setCar] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      const delta = e.key === 'ArrowUp' || e.key === 'w' ? { y: -1, x: 0 } :
        e.key === 'ArrowDown' || e.key === 's' ? { y: 1, x: 0 } :
        e.key === 'ArrowLeft' || e.key === 'a' ? { y: 0, x: -1 } :
        e.key === 'ArrowRight' || e.key === 'd' ? { y: 0, x: 1 } : null;
      if (delta) setCar((c) => ({ x: c.x + delta.x, y: c.y + delta.y }));
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  const nearest = useMemo(
    () => buildings.slice().sort((a, b) => dist(a, car) - dist(b, car))[0],
    [buildings, car]
  );

  return (
    <div className="grid md:grid-cols-[1fr_280px] gap-4">
      <div className="panel p-4 min-h-[520px] relative overflow-auto">
        <p className="text-xs text-slate-400 mb-3">Isometric fallback map (WASD/Arrows to drive)</p>
        <div className="relative h-[460px] bg-slate-950 rounded border border-slate-700">
          {buildings.map((b) => (
            <Link
              key={b.id}
              href={`/building/${b.id}`}
              className="absolute rounded bg-cyan-800/70 hover:bg-cyan-700 p-2 text-xs"
              style={{ left: `${b.grid_x * 18 + 20}px`, top: `${b.grid_y * 18 + 20}px`, width: `${Math.max(65, b.doc_count * 16)}px` }}
              title={`${b.label}\nTop entities: ${(b.entities || '').split(',').slice(0, 4).join(', ')}`}
            >
              <div className="font-semibold truncate">{b.label}</div>
              <div>{b.doc_count} docs</div>
            </Link>
          ))}
          <div className="absolute text-xl" style={{ left: `${car.x * 18 + 10}px`, top: `${car.y * 18 + 10}px` }}>🚗</div>
        </div>
      </div>
      <aside className="panel p-4 space-y-3">
        <h3 className="font-semibold">Minimap + Hover Info</h3>
        <p className="text-sm text-slate-300">Nearest building: <span className="text-cyan-300">{nearest?.label ?? 'N/A'}</span></p>
        <p className="text-sm">Neighborhoods: {Array.from(new Set(buildings.map((b) => b.neighborhood))).join(', ') || 'none'}</p>
        {nearest && <Link className="inline-block px-3 py-2 rounded bg-cyan-600" href={`/building/${nearest.id}`}>Open nearest shop</Link>}
      </aside>
    </div>
  );
}

function dist(b: Building, c: { x: number; y: number }) {
  return Math.hypot(b.grid_x - c.x, b.grid_y - c.y);
}
