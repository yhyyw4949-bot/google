import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const targetProfile = db.getProfileById(id);
    if (!targetProfile) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    if (targetProfile.role === 'admin') {
      return NextResponse.json({ error: 'Cannot suspend an admin account' }, { status: 400 });
    }

    const updated = db.updateProfile(id, {
      isSuspended: !targetProfile.isSuspended,
    });

    db.addAuditLog({
      id: `audit-${crypto.randomUUID()}`,
      userId: user.id,
      userEmail: user.email,
      action: updated?.isSuspended ? 'SUSPEND_CUSTOMER' : 'RESTORE_CUSTOMER',
      resourceType: 'profiles',
      resourceId: id,
      details: { email: targetProfile.email },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Toggle suspend error:', error);
    return NextResponse.json({ error: 'Failed to toggle suspension' }, { status: 500 });
  }
}
