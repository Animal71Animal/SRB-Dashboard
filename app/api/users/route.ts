import fs from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'public/data/srb-users.json');

export async function GET() {
  try {
    const fileData = fs.readFileSync(USERS_PATH, 'utf8');
    return new Response(fileData, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to read users' }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, email, password, role, name, mustResetPassword } = await req.json();
    const data = JSON.parse(fs.readFileSync(USERS_PATH, 'utf8'));
    let users = data.users || [];

    if (action === 'update-password') {
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex > -1) {
        users[userIndex].password = password;
        users[userIndex].mustResetPassword = false;
        fs.writeFileSync(USERS_PATH, JSON.stringify({ users }, null, 2));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
    }

    if (action === 'force-reset') {
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex > -1) {
        users[userIndex].mustResetPassword = true;
        fs.writeFileSync(USERS_PATH, JSON.stringify({ users }, null, 2));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
    }

    if (action === 'upsert') {
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], role, name, mustResetPassword };
      } else {
        users.push({ email, role, name, password: 'password123', mustResetPassword: true });
      }
      fs.writeFileSync(USERS_PATH, JSON.stringify({ users }, null, 2));
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update users' }), { status: 500 });
  }
}
