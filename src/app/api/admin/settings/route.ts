import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  await headers();
  try {
    const settings = db.getSiteSettings();
    return NextResponse.json(
      { settings },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Admin settings get error:', error);
    return NextResponse.json({ error: 'Failed to retrieve site settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updates = await req.json();
    const updated = db.updateSiteSettings(updates);

    db.addAuditLog({
      id: `audit-${crypto.randomUUID()}`,
      userId: user.id,
      userEmail: user.email,
      action: 'UPDATE_SITE_SETTINGS',
      resourceType: 'site_settings',
      resourceId: 'main',
      details: updates,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Admin settings update error:', error);
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 500 });
  }
}
