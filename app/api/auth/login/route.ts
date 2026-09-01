import { NextResponse } from 'next/server';
import { safeRead } from '@/lib/github';

const USERS_PATH = 'public/data/srb-users.json';

/**
 * POST /api/auth/login
 * Verifies email + password against the staff user list without exposing
 * other users' passwords or hash material. Returns a minimal identity
 * payload that the client can use to start a session and decide whether
 * to redirect into the password-reset flow.
 *
 * Intentionally returns the same `ok: false` shape for unknown emails
 * and wrong passwords so callers cannot enumerate accounts.
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { data } = await safeRead<{ users: any[] }>(USERS_PATH, { users: [] });
    const users = data.users || [];
    const normalized = email.toLowerCase().trim();
    const matched = users.find((u: any) => (u.email || '').toLowerCase() === normalized);

    if (!matched || matched.password !== password) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      email: matched.email,
      role: matched.role,
      name: matched.name || null,
      mustResetPassword: !!matched.mustResetPassword,
    });
  } catch (error) {
    console.error('[auth login] POST failed:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}