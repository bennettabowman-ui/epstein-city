import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/bootstrap';
import { getCityBuildings } from '@/lib/db/queries';

export async function GET() {
  ensureInit();
  return NextResponse.json(getCityBuildings());
}
