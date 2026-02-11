'use client';

import { useEffect, useState } from 'react';

export function SafeModeToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/toggle-safe').then((r) => r.json()).then((d) => setEnabled(d.enabled));
  }, []);

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={enabled}
        onChange={async (e) => {
          const next = e.target.checked;
          setEnabled(next);
          await fetch('/api/toggle-safe', { method: 'POST', body: JSON.stringify({ enabled: next }) });
        }}
      />
      Safe Mode {enabled ? 'ON' : 'OFF'}
    </label>
  );
}
