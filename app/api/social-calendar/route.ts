import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";
import { filterByVenue, getVenueParam, withDefaultVenue } from "@/lib/venue";

const FILE = "public/data/srb-social-calendar.json";

export interface SocialPost {
  id: string;
  platform: string;
  postType: string;
  captionPreview: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "Draft" | "Scheduled" | "Posted";
  venue?: string;
}

export async function GET(req: NextRequest) {
  const { data } = await safeRead<SocialPost[]>(FILE, []);
  return NextResponse.json(filterByVenue(data, getVenueParam(req)));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead<SocialPost[]>(FILE, []);
    const item: SocialPost = { id: `sc-${Date.now()}`, ...withDefaultVenue(body) };
    await safeWrite(FILE, [item, ...data], sha, `feat: add social post ${item.id}`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...changes } = await req.json();
    const { data, sha } = await safeRead<SocialPost[]>(FILE, []);
    const idx = data.findIndex((p) => p.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    data[idx] = { ...data[idx], ...changes };
    await safeWrite(FILE, data, sha, `fix: update social post ${id}`);
    return NextResponse.json({ ok: true, item: data[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<SocialPost[]>(FILE, []);
    await safeWrite(FILE, data.filter((p) => p.id !== id), sha, `chore: delete social post ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
