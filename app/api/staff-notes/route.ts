import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";

const FILE = "public/data/srb-staff-notes.json";

export interface StaffNote {
  id: string;
  date: string;
  title: string;
  content: string;
}

export async function GET() {
  const { data } = await safeRead<StaffNote[]>(FILE, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead<StaffNote[]>(FILE, []);
    const item: StaffNote = {
      id: `note-${Date.now()}`,
      date: body.date ?? new Date().toISOString().split("T")[0],
      title: body.title ?? "Untitled",
      content: body.content ?? "",
    };
    const updated = [item, ...data];
    await safeWrite(FILE, updated, sha, `feat: add staff note "${item.title}"`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...changes } = await req.json();
    const { data, sha } = await safeRead<StaffNote[]>(FILE, []);
    const idx = data.findIndex((n) => n.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    data[idx] = { ...data[idx], ...changes };
    await safeWrite(FILE, data, sha, `fix: update note ${id}`);
    return NextResponse.json({ ok: true, item: data[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<StaffNote[]>(FILE, []);
    await safeWrite(FILE, data.filter((n) => n.id !== id), sha, `chore: delete note ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
