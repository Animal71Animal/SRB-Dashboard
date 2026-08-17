import { NextResponse } from 'next/server';
import { safeRead, writeToGitHub } from '@/lib/github';

const FILE_PATH = 'public/data/promotional-materials.json';

export async function GET() {
  try {
    const { data } = await safeRead(FILE_PATH, { 
      torch1: { heavy: [], upcoming: [] },
      torch2: { heavy: [], upcoming: [] }
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ 
      torch1: { heavy: [], upcoming: [] },
      torch2: { heavy: [], upcoming: [] } 
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { torch, section, item }
    const { torch, section, item } = body;
    const { data, sha } = await safeRead(FILE_PATH, { 
      torch1: { heavy: [], upcoming: [] },
      torch2: { heavy: [], upcoming: [] } 
    });
    
    const newItem = {
      id: Date.now().toString(),
      ...item, // title, date, description, verbiage, drinkSpecials
      timestamp: new Date().toISOString()
    };
    
    // @ts-ignore
    const updatedSection = [...(data[torch][section] || []), newItem];
    // @ts-ignore
    const updatedData = { ...data, [torch]: { ...data[torch], [section]: updatedSection } };
    
    await writeToGitHub(FILE_PATH, updatedData, sha, `promo: update ${torch} ${section}`);
    
    return NextResponse.json({ ok: true, item: newItem });
  } catch (e) {
    console.error('[promo api] POST failed:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json(); // { torch, section, id, update }
    const { torch, section, id, update } = body;
    const { data, sha } = await safeRead(FILE_PATH, { 
      torch1: { heavy: [], upcoming: [] },
      torch2: { heavy: [], upcoming: [] } 
    });
    
    // @ts-ignore
    const updatedSection = (data[torch][section] || []).map((item: any) => 
      item.id === id ? { ...item, ...update } : item
    );
    // @ts-ignore
    const updatedData = { ...data, [torch]: { ...data[torch], [section]: updatedSection } };
    
    await writeToGitHub(FILE_PATH, updatedData, sha, `promo: edit ${torch} ${section} ${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const torch = searchParams.get('torch') as 'torch1' | 'torch2';
    const section = searchParams.get('section') as 'heavy' | 'upcoming';
    const id = searchParams.get('id');
    
    const { data, sha } = await safeRead(FILE_PATH, { 
      torch1: { heavy: [], upcoming: [] },
      torch2: { heavy: [], upcoming: [] } 
    });
    
    // @ts-ignore
    const updatedSection = (data[torch][section] || []).filter((m: any) => m.id !== id);
    // @ts-ignore
    const updatedData = { ...data, [torch]: { ...data[torch], [section]: updatedSection } };
    
    await writeToGitHub(FILE_PATH, updatedData, sha, `promo: delete ${id}`);
    
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
