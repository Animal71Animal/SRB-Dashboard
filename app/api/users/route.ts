import { NextResponse } from 'next/server';
import { safeRead, writeToGitHub } from '@/lib/github';

const USERS_PATH = 'public/data/srb-users.json';

export async function GET() {
  try {
    const { data } = await safeRead(USERS_PATH, { users: [] });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, email, password, role, name, mustResetPassword } = await req.json();
    const { data, sha } = await safeRead(USERS_PATH, { users: [] });
    let users = data.users || [];

    if (action === 'update-password') {
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex > -1) {
        users[userIndex].password = password;
        users[userIndex].mustResetPassword = false;
        await writeToGitHub(USERS_PATH, { users }, sha, `auth: password reset for ${email}`);
        return NextResponse.json({ success: true });
      }
    }

    if (action === 'force-reset') {
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex > -1) {
        users[userIndex].mustResetPassword = true;
        await writeToGitHub(USERS_PATH, { users }, sha, `auth: force reset for ${email}`);
        return NextResponse.json({ success: true });
      }
    }

    if (action === 'delete') {
      const initialCount = users.length;
      users = users.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());
      if (users.length < initialCount) {
        await writeToGitHub(USERS_PATH, { users }, sha, `auth: delete user ${email}`);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'upsert') {
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], role, name, mustResetPassword };
      } else {
        users.push({ email, role, name, password: 'password123', mustResetPassword: true });
      }
      await writeToGitHub(USERS_PATH, { users }, sha, `auth: upsert user ${email}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[users api] POST failed:', error);
    return NextResponse.json({ error: 'Failed to update users' }, { status: 500 });
  }
}
