import { NextRequest, NextResponse } from 'next/server';
import { ensureInit } from '@/lib/bootstrap';
import { search } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  ensureInit();
  const q = request.nextUrl.searchParams.get('q') ?? '';
  return NextResponse.json(search(q));
}
