import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";
import { filterByVenue, getVenueParam, withDefaultVenue } from "@/lib/venue";

const FILE = "public/data/srb-campaigns.json";

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Completed" | "Paused" | "Planned";
  notes: string;
  venue?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { data } = await safeRead<Campaign[]>(FILE, []);
    return NextResponse.json(filterByVenue(data, getVenueParam(req)));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead<Campaign[]>(FILE, []);
    const item: Campaign = { id: `camp-${Date.now()}`, ...withDefaultVenue(body) };
    const updated = [item, ...data];
    await safeWrite(FILE, updated, sha, `feat: add campaign "${item.name}"`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...changes } = await req.json();
    const { data, sha } = await safeRead<Campaign[]>(FILE, []);
    const idx = data.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    data[idx] = { ...data[idx], ...changes };
    await safeWrite(FILE, data, sha, `fix: update campaign ${id}`);
    return NextResponse.json({ ok: true, item: data[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<Campaign[]>(FILE, []);
    await safeWrite(FILE, data.filter((c) => c.id !== id), sha, `chore: delete campaign ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
