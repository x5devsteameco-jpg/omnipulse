import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    const accounts = db.getAccounts(clientId);

    return NextResponse.json({ accounts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}