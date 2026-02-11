const patterns = {
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  phone: /\b(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  bank: /\b(?:\d[ -]*?){13,16}\b/g,
  address: /\b\d{1,5}\s+[A-Za-z0-9.\s]+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi
};

export function redactText(text: string, safeMode: boolean, privateNames: string[] = []): string {
  if (!safeMode) return text;
  let out = text;
  for (const [key, regex] of Object.entries(patterns)) {
    out = out.replace(regex, `[REDACTED_${key.toUpperCase()}]`);
  }
  for (const n of privateNames) {
    out = out.replace(new RegExp(`\\b${escapeRegExp(n)}\\b`, 'g'), '[REDACTED_NAME]');
  }
  return out;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
