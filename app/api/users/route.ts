import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";

const FILE = "public/data/srb-users.json";

export async function GET() {
  const { data } = await safeRead(FILE);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { data, sha } = await safeRead(FILE);
  const body = await req.json(); // { email, role, name }
  
  const users = data.users || [];
  const idx = users.findIndex((u: any) => u.email === body.email);
  
  if (idx > -1) {
    users[idx].role = body.role;
    if (body.name) users[idx].name = body.name;
  } else {
    users.push(body);
  }
  
  await safeWrite(FILE, { users }, sha, `feat: update user ${body.email}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { data, sha } = await safeRead(FILE);
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  
  const users = (data.users || []).filter((u: any) => u.email !== email);
  await safeWrite(FILE, { users }, sha, `feat: remove user ${email}`);
  return NextResponse.json({ ok: true });
}
