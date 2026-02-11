import { NextRequest, NextResponse } from 'next/server';
import { ensureInit } from '@/lib/bootstrap';
import { setSafeMode, getSafeMode } from '@/lib/db/queries';

export async function GET() {
  ensureInit();
  return NextResponse.json({ enabled: getSafeMode().value === '1' });
}

export async function POST(request: NextRequest) {
  ensureInit();
  const { enabled } = await request.json();
  setSafeMode(Boolean(enabled));
  return NextResponse.json({ enabled: Boolean(enabled) });
}
