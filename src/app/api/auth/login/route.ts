import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = db.getProfileByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isSuspended) {
      return NextResponse.json({ error: 'Account has been suspended. Please contact support.' }, { status: 403 });
    }

    const isValid = db.verifyPassword(user.id, password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken(user.id, user.email, user.role);

    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set('gap_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
