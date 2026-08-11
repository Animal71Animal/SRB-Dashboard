import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";
import { filterByVenue, getVenueParam, withDefaultVenue } from "@/lib/venue";

const FILE = "public/data/srb-content-assets.json";

export interface ContentAsset {
  id: string;
  name: string;
  type: string;
  dateCreated: string;
  description: string;
  link: string;
  venue?: string;
}

export async function GET(req: NextRequest) {
  const { data } = await safeRead<ContentAsset[]>(FILE, []);
  return NextResponse.json(filterByVenue(data, getVenueParam(req)));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead<ContentAsset[]>(FILE, []);
    const item: ContentAsset = {
      id: `asset-${Date.now()}`,
      name: body.name ?? "",
      type: body.type ?? "Flyer",
      dateCreated: body.dateCreated ?? new Date().toISOString().split("T")[0],
      description: body.description ?? "",
      link: body.link ?? "",
      ...withDefaultVenue({ venue: body.venue }),
    };
    await safeWrite(FILE, [item, ...data], sha, `feat: add asset "${item.name}"`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<ContentAsset[]>(FILE, []);
    await safeWrite(FILE, data.filter((a) => a.id !== id), sha, `chore: delete asset ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
