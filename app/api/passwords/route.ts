import { NextResponse } from 'next/server';
import { safeRead, writeToGitHub } from '@/lib/github';

const FILE_PATH = 'public/data/passwords.json';

export async function GET() {
  try {
    const { data } = await safeRead(FILE_PATH, { passwords: [] });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ passwords: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead(FILE_PATH, { passwords: [] });
    
    // updatedData expects { passwords: [ { id, application, password } ] }
    await writeToGitHub(FILE_PATH, body, sha, `passwords: update by admin`);
    
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[passwords api] POST failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
