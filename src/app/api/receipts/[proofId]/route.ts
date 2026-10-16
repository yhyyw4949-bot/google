import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db/store';
import { getCurrentUser } from '@/lib/auth';

const RECEIPTS_DIR = path.join(process.cwd(), 'data', 'receipts');

export async function GET(
  req: Request,
  { params }: { params: Promise<{ proofId: string }> }
) {
  try {
    const { proofId } = await params;
    const proof = db.getPaymentProofById(proofId);

    if (!proof) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const order = db.getOrderById(proof.orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Access authorization check
    const user = await getCurrentUser();
    const url = new URL(req.url);
    const guestEmail = url.searchParams.get('email');

    const isAdmin = user?.role === 'admin';
    const isOwner = user && user.id === order.customerId;
    const isEmailMatched =
      (user && user.email.toLowerCase() === order.customerEmail.toLowerCase()) ||
      (guestEmail && guestEmail.trim().toLowerCase() === order.customerEmail.toLowerCase());

    if (!isAdmin && !isOwner && !isEmailMatched) {
      return NextResponse.json({ error: 'Unauthorized to view this receipt' }, { status: 403 });
    }

    // Check if file exists on disk
    const filePath = path.join(RECEIPTS_DIR, proof.filePath);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Receipt file does not exist on server storage.' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': proof.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${proof.originalFilename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Receipt download error:', error);
    return NextResponse.json({ error: 'Failed to retrieve receipt' }, { status: 500 });
  }
}
