import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite } from "@/lib/github";

const FILE = "public/data/srb-hours.json";

export interface HoursLog {
  id: string;
  date: string;        // YYYY-MM-DD — derived from clockIn
  clockIn: string;     // ISO timestamp
  clockOut: string;    // ISO timestamp
  hours: number;       // computed decimal hours (clockOut - clockIn)
  note: string;        // activity / description
  mode: "timer" | "manual";
}

function calcHours(clockIn: string, clockOut: string): number {
  const a = new Date(clockIn).getTime();
  const b = new Date(clockOut).getTime();
  if (isNaN(a) || isNaN(b) || b <= a) return 0;
  const hrs = (b - a) / (1000 * 60 * 60);
  return Math.round(hrs * 100) / 100;
}

export async function GET() {
  const { data } = await safeRead<HoursLog[]>(FILE, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clockIn = body.clockIn;
    const clockOut = body.clockOut;
    if (!clockIn || !clockOut) {
      return NextResponse.json({ ok: false, error: "Missing clockIn/clockOut" }, { status: 400 });
    }
    const hours = calcHours(clockIn, clockOut);
    if (hours <= 0) {
      return NextResponse.json({ ok: false, error: "clockOut must be after clockIn" }, { status: 400 });
    }
    const { data, sha } = await safeRead<HoursLog[]>(FILE, []);
    const item: HoursLog = {
      id: `hrs-${Date.now()}`,
      date: new Date(clockIn).toISOString().split("T")[0],
      clockIn: new Date(clockIn).toISOString(),
      clockOut: new Date(clockOut).toISOString(),
      hours,
      note: (body.note ?? "").trim() || "Off-Site Work",
      mode: body.mode === "manual" ? "manual" : "timer",
    };
    const updated = [item, ...data];
    await safeWrite(FILE, updated, sha, `feat: log ${item.hours.toFixed(2)} hrs (${item.mode})`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...changes } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<HoursLog[]>(FILE, []);
    const idx = data.findIndex((l) => l.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const merged: HoursLog = { ...data[idx], ...changes, id: data[idx].id };
    if (changes.clockIn || changes.clockOut) {
      merged.hours = calcHours(merged.clockIn, merged.clockOut);
      merged.date = new Date(merged.clockIn).toISOString().split("T")[0];
    }
    data[idx] = merged;
    await safeWrite(FILE, data, sha, `fix: update hours log ${id}`);
    return NextResponse.json({ ok: true, item: merged });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    const { data, sha } = await safeRead<HoursLog[]>(FILE, []);
    await safeWrite(FILE, data.filter((l) => l.id !== id), sha, `chore: delete hours log ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
