import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public/data/srb-dj-mc-comm.json');

export async function GET() {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (e) {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fileContent = fs.readFileSync(DATA_PATH, 'utf8');
    const data = JSON.parse(fileContent);
    
    const newMessage = {
      id: Date.now().toString(),
      sender: body.sender,
      text: body.text,
      timestamp: new Date().toISOString()
    };
    
    data.messages.push(newMessage);
    // Keep only last 100 messages to prevent file bloat
    if (data.messages.length > 100) {
      data.messages = data.messages.slice(-100);
    }
    
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return NextResponse.json({ ok: true, message: newMessage });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to post message" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const fileContent = fs.readFileSync(DATA_PATH, 'utf8');
    const data = JSON.parse(fileContent);
    
    data.messages = data.messages.filter((m: any) => m.id !== id);
    
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
