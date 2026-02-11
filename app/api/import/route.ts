import { NextRequest, NextResponse } from 'next/server';
import { ensureInit } from '@/lib/bootstrap';
import { ingestFolder } from '@/lib/indexing/ingest';

export async function POST(request: NextRequest) {
  ensureInit();
  const { folderPath } = await request.json();
  if (!folderPath) return NextResponse.json({ error: 'folderPath required' }, { status: 400 });
  const result = await ingestFolder(folderPath);
  return NextResponse.json(result);
}
