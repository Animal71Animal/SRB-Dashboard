import { NextResponse } from 'next/server';
import { safeRead, writeToGitHub } from '@/lib/github';

const FILE_PATH = 'public/data/promotional-materials.json';

export type TorchKey = 'torch1' | 'torch2';
export type SectionKey = 'heavy' | 'upcoming';

/**
 * Snapshot of the source event from the Event Calendar at the time of linking.
 * Kept denormalized so promo cards remain identifiable and renderable even if
 * the source event is later edited or (in remote outages) unavailable.
 */
export interface LinkedEventSnapshot {
  id: string;
  kind: 'oneoff' | 'series';
  name: string;
  date?: string;        // for oneOffs
  startDate?: string;   // for series
  dates?: string[];     // for series
  theme?: string;
  who?: string;
  format?: string;
  drinks?: string;
  games?: string;
  costuming?: string;
  icon?: string;
  venue?: string;
  status?: string;
  linkedAt: string;
}

export interface PromoItem {
  id: string;
  title: string;
  date: string;
  description: string;
  verbiage: string;
  drinkSpecials: string;
  /** MC verbiage entered by staff — persisted in its own collapsible box. */
  mcVerbiage?: string;
  /** Whether the MC verbiage box is currently collapsed (UI state). */
  mcVerbiageCollapsed?: boolean;
  /** Event Calendar event id this promo card was copied from. */
  eventId?: string;
  /** "oneoff" or "series" — how the source event is identified. */
  eventKind?: 'oneoff' | 'series';
  /** Denormalized snapshot of the linked event. */
  linkedEvent?: LinkedEventSnapshot;
  timestamp?: string;
}

export interface TorchSection {
  heavy: PromoItem[];
  upcoming: PromoItem[];
}

export interface PromoData {
  torch1: TorchSection;
  torch2: TorchSection;
}

const EMPTY: PromoData = {
  torch1: { heavy: [], upcoming: [] },
  torch2: { heavy: [], upcoming: [] },
};

function newId(): string {
  // Sufficient uniqueness for client-side optimistic UI; server is authoritative.
  return `${Date.now().toString()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  try {
    const { data } = await safeRead<PromoData>(FILE_PATH, EMPTY);
    // Defensive defaults — preserve any pre-existing remote data even if malformed.
    const out: PromoData = {
      torch1: { heavy: data?.torch1?.heavy ?? [], upcoming: data?.torch1?.upcoming ?? [] },
      torch2: { heavy: data?.torch2?.heavy ?? [], upcoming: data?.torch2?.upcoming ?? [] },
    };
    return NextResponse.json(out);
  } catch (e) {
    return NextResponse.json(EMPTY);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json(); // { torch, section, item }
    const torch = body?.torch as TorchKey;
    const section = body?.section as SectionKey;
    const incoming: Partial<PromoItem> = body?.item ?? {};

    if (torch !== 'torch1' && torch !== 'torch2') {
      return NextResponse.json({ ok: false, error: 'Invalid torch' }, { status: 400 });
    }
    if (section !== 'heavy' && section !== 'upcoming') {
      return NextResponse.json({ ok: false, error: 'Invalid section' }, { status: 400 });
    }

    const { data, sha } = await safeRead<PromoData>(FILE_PATH, EMPTY);
    const safeData: PromoData = {
      torch1: { heavy: data?.torch1?.heavy ?? [], upcoming: data?.torch1?.upcoming ?? [] },
      torch2: { heavy: data?.torch2?.heavy ?? [], upcoming: data?.torch2?.upcoming ?? [] },
    };

    const newItem: PromoItem = {
      id: newId(),
      title: incoming.title ?? '',
      date: incoming.date ?? '',
      description: incoming.description ?? '',
      verbiage: incoming.verbiage ?? '',
      drinkSpecials: incoming.drinkSpecials ?? '',
      mcVerbiage: incoming.mcVerbiage ?? '',
      mcVerbiageCollapsed: incoming.mcVerbiageCollapsed ?? false,
      eventId: incoming.eventId,
      eventKind: incoming.eventKind,
      linkedEvent: incoming.linkedEvent,
      timestamp: new Date().toISOString(),
    };

    const updatedSection = [...safeData[torch][section], newItem];
    const updatedData: PromoData = {
      ...safeData,
      [torch]: { ...safeData[torch], [section]: updatedSection },
    };

    await writeToGitHub(FILE_PATH, updatedData, sha, `promo: add ${torch}/${section} from event ${newItem.eventId ?? 'manual'}`);
    return NextResponse.json({ ok: true, item: newItem });
  } catch (e) {
    console.error('[promo api] POST failed:', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json(); // { torch, section, id, update }
    const torch = body?.torch as TorchKey;
    const section = body?.section as SectionKey;
    const id = body?.id as string | undefined;
    const update: Partial<PromoItem> = body?.update ?? {};

    if (torch !== 'torch1' && torch !== 'torch2') {
      return NextResponse.json({ ok: false, error: 'Invalid torch' }, { status: 400 });
    }
    if (section !== 'heavy' && section !== 'upcoming') {
      return NextResponse.json({ ok: false, error: 'Invalid section' }, { status: 400 });
    }
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    }

    const { data, sha } = await safeRead<PromoData>(FILE_PATH, EMPTY);
    const safeData: PromoData = {
      torch1: { heavy: data?.torch1?.heavy ?? [], upcoming: data?.torch1?.upcoming ?? [] },
      torch2: { heavy: data?.torch2?.heavy ?? [], upcoming: data?.torch2?.upcoming ?? [] },
    };

    const updatedSection = safeData[torch][section].map((item) =>
      item.id === id ? { ...item, ...update } : item
    );
    const updatedData: PromoData = {
      ...safeData,
      [torch]: { ...safeData[torch], [section]: updatedSection },
    };

    await writeToGitHub(FILE_PATH, updatedData, sha, `promo: edit ${torch}/${section} ${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[promo api] PUT failed:', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const torch = searchParams.get('torch') as TorchKey;
    const section = searchParams.get('section') as SectionKey;
    const id = searchParams.get('id');

    if (torch !== 'torch1' && torch !== 'torch2') {
      return NextResponse.json({ ok: false, error: 'Invalid torch' }, { status: 400 });
    }
    if (section !== 'heavy' && section !== 'upcoming') {
      return NextResponse.json({ ok: false, error: 'Invalid section' }, { status: 400 });
    }
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    }

    const { data, sha } = await safeRead<PromoData>(FILE_PATH, EMPTY);
    const safeData: PromoData = {
      torch1: { heavy: data?.torch1?.heavy ?? [], upcoming: data?.torch1?.upcoming ?? [] },
      torch2: { heavy: data?.torch2?.heavy ?? [], upcoming: data?.torch2?.upcoming ?? [] },
    };

    const updatedSection = safeData[torch][section].filter((m) => m.id !== id);
    const updatedData: PromoData = {
      ...safeData,
      [torch]: { ...safeData[torch], [section]: updatedSection },
    };

    await writeToGitHub(FILE_PATH, updatedData, sha, `promo: delete ${torch}/${section} ${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[promo api] DELETE failed:', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}