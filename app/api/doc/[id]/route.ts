import { NextRequest, NextResponse } from 'next/server';
import { ensureInit } from '@/lib/bootstrap';
import { getDocument, getSafeMode } from '@/lib/db/queries';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  ensureInit();
  const safeMode = getSafeMode().value === '1';
  return NextResponse.json(getDocument(Number(params.id), safeMode));
}
