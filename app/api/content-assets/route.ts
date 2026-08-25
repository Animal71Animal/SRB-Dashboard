import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";
import { getVenueParam, withDefaultVenue } from "@/lib/venue";

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
  const venue = getVenueParam(req);

  // Shared assets are visible from either venue. Keep the legacy "both"
  // value working while accepting the UI's explicit torch12 value.
  if (venue && venue !== "combined") {
    return NextResponse.json(data.filter((asset) =>
      asset.venue === venue || asset.venue === "torch12" || asset.venue === "both"
    ));
  }

  return NextResponse.json(data);
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

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<ContentAsset[]>(FILE, []);
    const index = data.findIndex((a) => a.id === body.id);
    if (index === -1) return NextResponse.json({ ok: false, error: "Asset not found" }, { status: 404 });
    data[index] = { ...data[index], ...body };
    await safeWrite(FILE, data, sha, `feat: update asset "${body.name}"`);
    return NextResponse.json({ ok: true });
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
