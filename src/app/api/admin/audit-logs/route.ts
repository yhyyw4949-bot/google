import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const logs = db.getAuditLogs(100);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}
