import { NextResponse } from 'next/server';
import { safeRead, writeToGitHub } from '@/lib/github';

const FILE_PATH = 'public/data/srb-dj-mc-comm.json';

const TTL_DAYS = 5;

function pruneOld(messages: any[]): any[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - TTL_DAYS);
  cutoff.setHours(0, 0, 0, 0);
  return messages.filter((m: any) => {
    const ts = m.timestamp ? new Date(m.timestamp) : null;
    return ts && ts >= cutoff;
  });
}

export async function GET() {
  try {
    const { data, sha } = await safeRead(FILE_PATH, { messages: [] });
    const pruned = pruneOld(data.messages || []);
    // If pruning dropped messages, persist the cleaned list
    if (pruned.length < (data.messages || []).length) {
      await writeToGitHub(FILE_PATH, { messages: pruned }, sha, `chat: auto-prune messages older than ${TTL_DAYS} days`);
    }
    return NextResponse.json({ messages: pruned });
  } catch (e) {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead(FILE_PATH, { messages: [] });
    
    const now = new Date();
    const newMessage = {
      id: Date.now().toString(),
      sender: body.sender,
      text: body.text,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Denver' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Denver' })
    };
    
    const all = [...(data.messages || []), newMessage];
    const pruned = pruneOld(all);
    const updatedMessages = pruned.slice(-100);
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

// PATCH /api/dj-mc-communications — toggle a reaction on a message
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, user, reaction } = body;
    const { data, sha } = await safeRead(FILE_PATH, { messages: [] });

    const updatedMessages = (data.messages || []).map((m: any) => {
      if (m.id !== id) return m;
      const reactions = m.reactions || {};
      const users = reactions[reaction] || [];
      const idx = users.indexOf(user);
      if (idx >= 0) {
        users.splice(idx, 1); // remove
        if (users.length === 0) delete reactions[reaction];
      } else {
        users.push(user); // add
        reactions[reaction] = users;
      }
      return { ...m, reactions };
    });

    await writeToGitHub(FILE_PATH, { messages: updatedMessages }, sha, `chat: reaction ${reaction} by ${user}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[messaging api] PATCH failed:', e);
    return NextResponse.json({ ok: false, error: "Failed to update reaction" }, { status: 500 });
  }
}
