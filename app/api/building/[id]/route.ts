import { NextRequest, NextResponse } from 'next/server';
import { ensureInit } from '@/lib/bootstrap';
import { getBuilding } from '@/lib/db/queries';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  ensureInit();
  return NextResponse.json(getBuilding(Number(params.id)));
}
