import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db/store';
import { signToken } from '@/lib/auth';
import { UserProfile } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { email, password, fullName, phone } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = db.getProfileByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newUser: UserProfile = {
      id: `usr-${crypto.randomUUID()}`,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      phone: phone?.trim(),
      role: 'customer',
      isSuspended: false,
      createdAt: now,
      updatedAt: now,
    };

    db.createProfile(newUser, password);

    // Sign session token
    const token = signToken(newUser.id, newUser.email, newUser.role);

    const response = NextResponse.json({
      success: true,
      user: newUser,
    });

    response.cookies.set('gap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
