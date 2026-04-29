import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const accounts = clientId ? db.getAccounts(clientId) : db.getAccounts();

    return NextResponse.json({ accounts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, platform, username, accountId, accessToken, extraData } = body;

    if (!clientId || !platform || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const account = db.createAccount({
      clientId,
      platform,
      username,
      accountId,
      accessToken,
      extraData: extraData || {}
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}