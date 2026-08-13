import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite, readLocal, writeLocal } from "@/lib/github";
import { filterByVenue, getVenueParam, withDefaultVenue } from "@/lib/venue";

const FILE = "public/data/srb-events.json";
const LOCAL = "srb-events.json";

export type SRBStatus = "Confirmed" | "Planned" | "Cancelled";

export interface ShowEntry {
  dates: string[];
  entertainer: string;
  showName: string;
  time?: string;
}

export interface OneOffEvent {
  id: string;
  date: string;
  name: string;
  theme: string;
  status: SRBStatus;
  venue?: string;
  icon?: string;
  who?: string;
  format?: string;
  drinks?: string;
  games?: string;
  costuming?: string;
  shows?: ShowEntry[];
}

export interface EventSeries {
  id: string;
  name: string;
  theme: string;
  status: SRBStatus;
  dates: string[];
  venue?: string;
  icon?: string;
  day?: string;
  startDate?: string;
  who?: string;
  format?: string;
  drinks?: string;
  games?: string;
  costuming?: string;
  flyerImage?: string;
  shows?: ShowEntry[];
}

export interface EventsFile {
  oneOffs: OneOffEvent[];
  series: EventSeries[];
}

const EMPTY: EventsFile = { oneOffs: [], series: [] };

function newId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export async function GET(req: NextRequest) {
  try {
    const { data } = await safeRead<EventsFile>(FILE, EMPTY);
    const venue = getVenueParam(req);
    const filtered: EventsFile = {
      oneOffs: filterByVenue(data.oneOffs ?? [], venue),
      series: filterByVenue(data.series ?? [], venue),
    };
    return NextResponse.json(filtered);
  } catch {
    const local = readLocal<EventsFile>(LOCAL) ?? EMPTY;
    return NextResponse.json(local);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead<EventsFile>(FILE, EMPTY);
    const { oneOffs = [], series = [] } = data;

    if (body.kind === "series") {
      const item: EventSeries = withDefaultVenue({
        id: newId("ser"),
        name: body.name ?? "",
        theme: body.theme ?? "",
        status: body.status ?? "Planned",
        dates: Array.isArray(body.dates) ? body.dates : [],
        icon: body.icon ?? "",
        day: body.day ?? "",
        startDate: body.startDate ?? "",
        who: body.who ?? "",
        format: body.format ?? "",
        drinks: body.drinks ?? "",
        games: body.games ?? "",
        costuming: body.costuming ?? "",
      });
      await safeWrite(FILE, { oneOffs, series: [item, ...series] }, sha, `feat: add event series "${item.name}"`);
      return NextResponse.json({ ok: true, item });
    }

    const item: OneOffEvent = withDefaultVenue({
      id: newId("evt"),
      date: body.date ?? "",
      name: body.name ?? "",
      theme: body.theme ?? "",
      status: body.status ?? "Planned",
      icon: body.icon ?? "",
      who: body.who ?? "",
      format: body.format ?? "",
      drinks: body.drinks ?? "",
      games: body.games ?? "",
      costuming: body.costuming ?? "",
    });
    await safeWrite(FILE, { oneOffs: [item, ...oneOffs], series }, sha, `feat: add event "${item.name}"`);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, kind, ...changes } = await req.json();
    const { data, sha } = await safeRead<EventsFile>(FILE, EMPTY);
    const { oneOffs = [], series = [] } = data;

    if (kind === "series") {
      const idx = series.findIndex((s) => s.id === id);
      if (idx === -1) return NextResponse.json({ ok: false, error: "Series not found" }, { status: 404 });
      
      // Build updated series with all editable fields preserved
      series[idx] = {
        ...series[idx],
        ...changes,
      };
      
      // Ensure startDate lands in the dates array for calendar display
      if (changes.startDate) {
        if (!series[idx].dates) series[idx].dates = [];
        if (!series[idx].dates.includes(changes.startDate)) {
          series[idx].dates.push(changes.startDate);
        }
      }
      
      await safeWrite(FILE, { oneOffs, series }, sha, `fix: update event series ${id}`);
      return NextResponse.json({ ok: true, item: series[idx] });
    }

    const idx = oneOffs.findIndex((e) => e.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Event not found" }, { status: 404 });
    
    oneOffs[idx] = {
      ...oneOffs[idx],
      ...changes,
    };
    
    await safeWrite(FILE, { oneOffs, series }, sha, `fix: update event ${id}`);
    return NextResponse.json({ ok: true, item: oneOffs[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const kind = url.searchParams.get("kind") ?? "oneoff";
    if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

    const { data, sha } = await safeRead<EventsFile>(FILE, EMPTY);
    const { oneOffs = [], series = [] } = data;

    if (kind === "series") {
      const next = series.filter((s) => s.id !== id);
      await safeWrite(FILE, { oneOffs, series: next }, sha, `chore: delete event series ${id}`);
      return NextResponse.json({ ok: true });
    }

    const next = oneOffs.filter((e) => e.id !== id);
    await safeWrite(FILE, { oneOffs: next, series }, sha, `chore: delete event ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}