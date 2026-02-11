import { describe, expect, it } from 'vitest';
import { redactText } from '@/lib/utils/redaction';

describe('redaction', () => {
  it('redacts core PII in safe mode', () => {
    const input = 'Email jane@example.com phone 212-555-1212 ssn 123-45-6789';
    const result = redactText(input, true, []);
    expect(result).toContain('[REDACTED_EMAIL]');
    expect(result).toContain('[REDACTED_PHONE]');
    expect(result).toContain('[REDACTED_SSN]');
  });

  it('passes through when safe mode disabled', () => {
    const input = 'jane@example.com';
    expect(redactText(input, false)).toBe(input);
  });
});
