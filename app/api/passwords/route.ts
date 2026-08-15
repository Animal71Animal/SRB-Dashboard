import { NextResponse } from 'next/server';
import { safeRead, writeToGitHub } from '@/lib/github';

const FILE_PATH = 'public/data/passwords.json';

export async function GET() {
  try {
    const { data } = await safeRead(FILE_PATH, { torch1: [], torch2: [] });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ torch1: [], torch2: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { torch1: [...], torch2: [...] }
    const { sha } = await safeRead(FILE_PATH, { torch1: [], torch2: [] });
    
    await writeToGitHub(FILE_PATH, body, sha, `passwords: dual-sheet update by admin`);
    
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[passwords api] POST failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
