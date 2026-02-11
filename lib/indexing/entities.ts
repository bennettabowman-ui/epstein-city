import { EntityType } from '@/lib/types';

const orgSuffix = /(Inc|LLC|Corp|Corporation|Foundation|University|Bank)$/;
const locationWords = /(City|County|Island|Beach|Street|Avenue|Road|Hotel)$/;
const dateRegex = /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+\s\d{1,2},\s\d{4}|\d{4})\b/g;

export interface ExtractedEntity { type: EntityType; value: string; isPrivate: boolean }

export function extractEntities(text: string): ExtractedEntity[] {
  const out: ExtractedEntity[] = [];
  const tokens = text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2}\b/g) ?? [];

  for (const token of tokens) {
    const type: EntityType = orgSuffix.test(token)
      ? 'org'
      : locationWords.test(token)
      ? 'location'
      : 'person';
    out.push({ type, value: token, isPrivate: type === 'person' && token.split(' ').length >= 2 });
  }

  const dates = text.match(dateRegex) ?? [];
  for (const d of dates) out.push({ type: 'date', value: d, isPrivate: false });

  return dedupe(out);
}

function dedupe(input: ExtractedEntity[]) {
  return Array.from(new Map(input.map((e) => [`${e.type}:${e.value}`, e])).values());
}
