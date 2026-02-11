import { NextRequest, NextResponse } from 'next/server';
import { ensureInit } from '@/lib/bootstrap';
import { exportReadingList } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  ensureInit();
  const { docIds } = await request.json();
  const rows = exportReadingList(docIds ?? []);
  return NextResponse.json({ rows });
}
