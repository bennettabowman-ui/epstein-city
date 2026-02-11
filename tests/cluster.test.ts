import { describe, expect, it } from 'vitest';
import { clusterDocs } from '@/lib/indexing/cluster';

describe('cluster determinism', () => {
  it('returns stable labels/order for same input', () => {
    const features = [
      { docId: 1, entities: ['Atlas Foundation', 'John Mercer'], keywords: ['court', 'hearing'] },
      { docId: 2, entities: ['Atlas Foundation'], keywords: ['court', 'timeline'] },
      { docId: 3, entities: ['Orion LLC'], keywords: ['flight', 'manifest'] }
    ];
    const a = clusterDocs(features);
    const b = clusterDocs(features);
    expect(a).toEqual(b);
    expect(a.length).toBe(2);
  });
});
