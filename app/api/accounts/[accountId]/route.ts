import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;

    const account = db.getAccount(accountId);

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const metrics = db.getMetrics(accountId).slice(0, 100);
    const trends = db.getTrends(accountId).slice(0, 30);
    const predictions = db.getPredictions(accountId).slice(0, 10);

    return NextResponse.json({
      account,
      metrics,
      trends,
      predictions
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;
    const body = await request.json();
    const { username, accessToken, tokenExpiresAt, extraData } = body;

    const account = db.updateAccount(accountId, {
      username,
      accessToken,
      tokenExpiresAt,
      extraData
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch {
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;

    db.deleteAccount(accountId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}