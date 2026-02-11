import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/bootstrap';
import { generateSeedDataset } from '@/scripts/seed-data';
import { ingestFolder } from '@/lib/indexing/ingest';

export async function POST() {
  ensureInit();
  const folder = generateSeedDataset();
  const result = await ingestFolder(folder);
  return NextResponse.json({ ...result, folder });
}
