'use client';

export function RelationshipGraph({ entities }: { entities: Array<{ value: string; count: number }> }) {
  const nodes = entities.slice(0, 16);
  return (
    <div className="panel p-3">
      <h4 className="font-semibold mb-2">Entity/Document Graph (lightweight)</h4>
      <svg width="100%" height="180" viewBox="0 0 500 180">
        {nodes.map((n, i) => {
          const x = 40 + (i % 8) * 56;
          const y = 45 + Math.floor(i / 8) * 85;
          return (
            <g key={n.value}>
              <circle cx={x} cy={y} r={8 + Math.min(10, n.count)} fill="#0891b2" />
              <text x={x + 12} y={y + 3} fill="#e2e8f0" fontSize="10">{n.value.slice(0, 14)}</text>
              <line x1={x} y1={y} x2={250} y2={90} stroke="#334155" />
            </g>
          );
        })}
        <circle cx="250" cy="90" r="18" fill="#22c55e" />
        <text x="276" y="93" fill="#e2e8f0" fontSize="12">Building docs</text>
      </svg>
    </div>
  );
}
