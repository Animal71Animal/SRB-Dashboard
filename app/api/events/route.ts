import { NextRequest, NextResponse } from "next/server";
import { safeRead, safeWrite, readLocal, writeLocal } from "@/lib/github";
import { filterByVenue, getVenueParam, withDefaultVenue } from "@/lib/venue";
import { computeSeriesDates, normalizeRecurrenceCode, CALENDAR_FROM, CALENDAR_TO } from "@/lib/recurrence";

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
  /** Dedicated MC/promo verbiage. Separate from `costuming`. Synced bidirectionally with linked Promotional Materials cards. */
  verbiage?: string;
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
  /** Dedicated MC/promo verbiage. Separate from `costuming`. Synced bidirectionally with linked Promotional Materials cards. */
  verbiage?: string;
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

/** Normalize legacy venue strings ("Torch 1" → "torch1"). */
function migrateVenueCode(v?: string): "torch1" | "torch2" | "both" | undefined {
  if (!v) return undefined;
  const lc = String(v).toLowerCase().trim();
  if (lc === "torch 1" || lc === "torch1") return "torch1";
  if (lc === "torch 2" || lc === "torch2") return "torch2";
  if (lc === "both") return "both";
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await safeRead<EventsFile>(FILE, EMPTY);
    const { oneOffs = [], series = [] } = data;

    // Normalize incoming venue value if present
    if ("venue" in body) body.venue = migrateVenueCode(body.venue);

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
        verbiage: body.verbiage ?? "",
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
      verbiage: body.verbiage ?? "",
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

    // Normalize incoming venue value if present
    if ("venue" in changes) {
      changes.venue = migrateVenueCode(changes.venue);
    }

    if (kind === "series") {
      const idx = series.findIndex((s) => s.id === id);
      if (idx === -1) return NextResponse.json({ ok: false, error: "Series not found" }, { status: 404 });

      // Build updated series with all editable fields preserved
      series[idx] = {
        ...series[idx],
        ...changes,
      };

      // Server-side: normalize recurrence code and regenerate dates[] using the shared rule registry
      if (series[idx].day) {
        const canonicalDay = normalizeRecurrenceCode(series[idx].day);
        if (canonicalDay) series[idx].day = canonicalDay;
        const sd = series[idx].startDate || changes.startDate;
        if (canonicalDay && sd) {
          series[idx].dates = computeSeriesDates(canonicalDay, sd, CALENDAR_FROM, CALENDAR_TO);
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