import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";

const FILE = "public/data/srb-entertainer-auditions.json";

export interface Audition {
  id: string;
  entertainerName: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM (24h)
  notes: string;
  venue?: string;
  status: string;     // "Pending" | "Hired" | "Not Hired"
  createdAt: string;
}

export async function GET() {
  const { data } = await safeRead<Audition[]>(FILE, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.entertainerName || !body.date || !body.time) {
      return NextResponse.json({ ok: false, error: "Name, date, and time are required" }, { status: 400 });
    }
    const { data, sha } = await safeRead<Audition[]>(FILE, []);
    const item: Audition = {
      id: `aud-${Date.now()}`,
      entertainerName: String(body.entertainerName).trim(),
      date: body.date,
      time: body.time,
      notes: body.notes ?? "",
      venue: body.venue ?? "Combined",
      status: body.status ?? "Pending",
      createdAt: new Date().toISOString(),
    };
    const updated = [item, ...data];
    await safeWrite(FILE, updated, sha, `feat: log audition for ${item.entertainerName} on ${item.date} ${item.time}`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ ok: false, error: "id and status are required" }, { status: 400 });
    }
    const allowed = ["Pending", "Hired", "Not Hired"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ ok: false, error: `status must be one of ${allowed.join(", ")}` }, { status: 400 });
    }
    const { data, sha } = await safeRead<Audition[]>(FILE, []);
    const idx = data.findIndex((c) => c.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ ok: false, error: "Audition not found" }, { status: 404 });
    }
    const updated = data.map((c) => (c.id === body.id ? { ...c, status: body.status } : c));
    await safeWrite(FILE, updated, sha, `fix(auditions): set ${updated[idx].entertainerName} → ${body.status}`);
    return NextResponse.json({ ok: true, item: updated[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<Audition[]>(FILE, []);
    await safeWrite(FILE, data.filter((c) => c.id !== id), sha, `chore: delete audition ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}