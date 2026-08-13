import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/srb-time-off.json');

export async function GET() {
  const data = fs.readFileSync(DATA_PATH, 'utf8');
  return NextResponse.json(JSON.parse(data));
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  
  const newRequest = {
    id: Date.now().toString(),
    email: body.email,
    date: body.date,
    reason: body.reason,
    timestamp: new Date().toISOString()
  };
  
  data.push(newRequest);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return NextResponse.json({ ok: true, request: newRequest });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  let data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  data = data.filter((r: any) => r.id !== id);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  return NextResponse.json({ ok: true });
}
