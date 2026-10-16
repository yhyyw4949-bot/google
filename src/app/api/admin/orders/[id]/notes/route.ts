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
    const order = db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { note } = await req.json();
    if (!note || !note.trim()) {
      return NextResponse.json({ error: 'Note content cannot be empty' }, { status: 400 });
    }

    const adminNote = db.addAdminNote({
      id: `note-${crypto.randomUUID()}`,
      orderId: order.id,
      adminId: user.id,
      adminName: user.fullName || 'Admin',
      note: note.trim(),
      isInternalOnly: true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, note: adminNote });
  } catch (error) {
    console.error('Add admin note error:', error);
    return NextResponse.json({ error: 'Failed to add admin note' }, { status: 500 });
  }
}
