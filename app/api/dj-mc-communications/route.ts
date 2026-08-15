import { NextResponse } from 'next/server';
import { safeRead, writeToGitHub } from '@/lib/github';

const FILE_PATH = 'public/data/srb-dj-mc-comm.json';

export async function GET() {
  try {
    const { data } = await safeRead(FILE_PATH, { messages: [] });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead(FILE_PATH, { messages: [] });
    
    const newMessage = {
      id: Date.now().toString(),
      sender: body.sender,
      text: body.text,
      timestamp: new Date().toISOString()
    };
    
    // @ts-ignore
    const updatedMessages = [...(data.messages || []), newMessage].slice(-100);
    const updatedData = { messages: updatedMessages };
    
    await writeToGitHub(FILE_PATH, updatedData, sha, `chat: new message from ${body.sender}`);
    
    return NextResponse.json({ ok: true, message: newMessage });
  } catch (e) {
    console.error('[messaging api] POST failed:', e);
    return NextResponse.json({ ok: false, error: "Failed to post message" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const { data, sha } = await safeRead(FILE_PATH, { messages: [] });
    
    // @ts-ignore
    const updatedMessages = (data.messages || []).filter((m: any) => m.id !== id);
    const updatedData = { messages: updatedMessages };
    
    await writeToGitHub(FILE_PATH, updatedData, sha, `chat: delete message ${id}`);
    
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[messaging api] DELETE failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
