import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');

    const account = db.getAccount(accountId);
    const metrics = db.getMetrics(accountId).slice(0, limit);

    return NextResponse.json({
      accountId,
      username: account?.username,
      platform: account?.platform,
      metrics,
      count: metrics.length
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}