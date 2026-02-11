import { describe, expect, it } from 'vitest';
import { extractEntities } from '@/lib/indexing/entities';

describe('entity extraction', () => {
  it('extracts person/org/date heuristically', () => {
    const result = extractEntities('John Mercer met Atlas Foundation on March 5, 2006 in Miami Beach Hotel.');
    expect(result.some((e) => e.type === 'person' && e.value.includes('John'))).toBe(true);
    expect(result.some((e) => e.type === 'org' && e.value.includes('Foundation'))).toBe(true);
    expect(result.some((e) => e.type === 'date')).toBe(true);
  });
});
