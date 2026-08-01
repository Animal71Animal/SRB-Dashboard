import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";

const FILE = "public/data/srb-attendance.json";

export interface AttendanceEntry {
  id: string;
  date: string;
  dayOfWeek: string;
  eventTheme: string;
  headcount: number;
  coverRevenue: string;
  notes: string;
}

export async function GET() {
  const { data } = await safeRead<AttendanceEntry[]>(FILE, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead<AttendanceEntry[]>(FILE, []);
    const item: AttendanceEntry = { id: `att-${Date.now()}`, ...body };
    const updated = [item, ...data].sort((a, b) => b.date.localeCompare(a.date));
    await safeWrite(FILE, updated, sha, `feat: add attendance ${item.date}`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<AttendanceEntry[]>(FILE, []);
    await safeWrite(FILE, data.filter((a) => a.id !== id), sha, `chore: delete attendance ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
