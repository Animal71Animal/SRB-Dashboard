import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite, readLocal, writeLocal } from "@/lib/github";

const FILE = "public/data/srb-party-concepts.json";
const LOCAL = "srb-party-concepts.json";

export interface PartyConcept {
  id: string;
  name: string;
  icon: string;
  day: string;
  who: string;
  format: string;
  drinks: string;
  games: string;
  costuming: string;
  approved: boolean;
  flyerDone: boolean;
  flyerImage?: string;
  startDate?: string;
  dates?: string[];
  frequency?: string;
}

export interface PromoIdea {
  id: string;
  name: string;
  icon: string;
  category: string;
  concept: string;
  format: string;
  distribution: string;
  status: string;
  approved: boolean;
  notes?: string;
  flyerUrl?: string;
  startDate?: string;
}

export interface PartyConceptsFile {
  weekly: PartyConcept[];
  monthly: PartyConcept[];
  yearly: PartyConcept[];
  promoIdeas: PromoIdea[];
  lastUpdated: string;
}

const EMPTY: PartyConceptsFile = {
  weekly: [],
  monthly: [],
  yearly: [],
  promoIdeas: [],
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  try {
    const { data } = await safeRead<PartyConceptsFile>(FILE, EMPTY);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(readLocal<PartyConceptsFile>(LOCAL) ?? EMPTY);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: PartyConceptsFile = await req.json();
    const { sha } = await safeRead<PartyConceptsFile>(FILE, EMPTY);
    const updated = { ...body, lastUpdated: new Date().toISOString() };
    await safeWrite(FILE, updated, sha, "feat(party-concepts): full data update");
    writeLocal(LOCAL, updated);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { section, id, ...changes } = await req.json();
    const { data, sha } = await safeRead<PartyConceptsFile>(FILE, EMPTY);

    if (section === "promoIdeas") {
      const idx = data.promoIdeas.findIndex((p) => p.id === id);
      if (idx !== -1) data.promoIdeas[idx] = { ...data.promoIdeas[idx], ...changes };
    } else {
      const arr = data[section as keyof Pick<PartyConceptsFile, "weekly" | "monthly" | "yearly">];
      if (arr) {
        const idx = arr.findIndex((c) => c.id === id);
        if (idx !== -1) arr[idx] = { ...arr[idx], ...changes };
      }
    }

    data.lastUpdated = new Date().toISOString();
    await safeWrite(FILE, data, sha, `fix(party-concepts): update ${section}/${id}`);
    writeLocal(LOCAL, data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
