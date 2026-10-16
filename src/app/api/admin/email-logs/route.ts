import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const emails = db.getEmailNotifications(100);
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Email logs error:', error);
    return NextResponse.json({ error: 'Failed to retrieve email logs' }, { status: 500 });
  }
}
