import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite, readLocal, writeLocal } from "@/lib/github";
import { filterByVenue, getVenueParam, withDefaultVenue } from "@/lib/venue";

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
  venue?: string;
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
  venue?: string;
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

export async function GET(req: NextRequest) {
  try {
    const { data } = await safeRead<PartyConceptsFile>(FILE, EMPTY);
    const venue = getVenueParam(req);
    const filtered: PartyConceptsFile = {
      ...data,
      weekly: filterByVenue(data.weekly ?? [], venue),
      monthly: filterByVenue(data.monthly ?? [], venue),
      yearly: filterByVenue(data.yearly ?? [], venue),
      promoIdeas: filterByVenue(data.promoIdeas ?? [], venue),
    };
    return NextResponse.json(filtered);
  } catch {
    const local = readLocal<PartyConceptsFile>(LOCAL) ?? EMPTY;
    return NextResponse.json(local);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: PartyConceptsFile = await req.json();
    const { sha } = await safeRead<PartyConceptsFile>(FILE, EMPTY);
    const updated: PartyConceptsFile = {
      ...body,
      weekly: (body.weekly ?? []).map((c) => withDefaultVenue(c)),
      monthly: (body.monthly ?? []).map((c) => withDefaultVenue(c)),
      yearly: (body.yearly ?? []).map((c) => withDefaultVenue(c)),
      promoIdeas: (body.promoIdeas ?? []).map((c) => withDefaultVenue(c)),
      lastUpdated: new Date().toISOString(),
    };
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
