import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";
import { filterByVenue, getVenueParam, withDefaultVenue } from "@/lib/venue";

const FILE = "public/data/srb-comp-codes.json";

export interface CompCode {
  id: string;
  code: string;
  recipientName: string;
  issuedDate: string;
  expiryDate: string;
  used: boolean;
  notes: string;
  venue?: string;
}

export async function GET(req: NextRequest) {
  const { data } = await safeRead<CompCode[]>(FILE, []);
  return NextResponse.json(filterByVenue(data, getVenueParam(req)));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead<CompCode[]>(FILE, []);
    const item: CompCode = {
      id: `cc-${Date.now()}`,
      code: body.code ?? "",
      recipientName: body.recipientName ?? "",
      issuedDate: body.issuedDate ?? new Date().toISOString().split("T")[0],
      expiryDate: body.expiryDate ?? "",
      used: body.used ?? false,
      notes: body.notes ?? "",
      ...withDefaultVenue({ venue: body.venue }),
    };
    const updated = [item, ...data];
    await safeWrite(FILE, updated, sha, `feat: add comp code "${item.code}" for ${item.recipientName}`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...changes } = await req.json();
    const { data, sha } = await safeRead<CompCode[]>(FILE, []);
    const idx = data.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    data[idx] = { ...data[idx], ...changes };
    await safeWrite(FILE, data, sha, `fix: update comp code ${id}`);
    return NextResponse.json({ ok: true, item: data[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<CompCode[]>(FILE, []);
    await safeWrite(FILE, data.filter((c) => c.id !== id), sha, `chore: delete comp code ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
