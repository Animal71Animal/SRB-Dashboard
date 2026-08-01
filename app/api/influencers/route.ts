import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";

const FILE = "public/data/srb-influencers.json";

export interface SocialProfile {
  handle: string;
  followers: string;
}

export interface Influencer {
  id: string;
  name: string;
  instagram?: SocialProfile;
  tiktok?: SocialProfile;
  twitter?: SocialProfile;
  youtube?: SocialProfile;
  facebook?: SocialProfile;
  status: "active" | "contacted" | "pending" | "passed";
  notes: string;
}

export async function GET() {
  const { data } = await safeRead<Influencer[]>(FILE, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead<Influencer[]>(FILE, []);
    const item: Influencer = { id: `inf-${Date.now()}`, ...body };
    await safeWrite(FILE, [item, ...data], sha, `feat: add influencer "${item.name}"`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...changes } = await req.json();
    const { data, sha } = await safeRead<Influencer[]>(FILE, []);
    const idx = data.findIndex((i) => i.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    data[idx] = { ...data[idx], ...changes };
    await safeWrite(FILE, data, sha, `fix: update influencer ${id}`);
    return NextResponse.json({ ok: true, item: data[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<Influencer[]>(FILE, []);
    await safeWrite(FILE, data.filter((i) => i.id !== id), sha, `chore: delete influencer ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
