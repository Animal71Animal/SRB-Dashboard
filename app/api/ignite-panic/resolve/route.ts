import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const IGNITE_BASE_URL = process.env.IGNITE_BASE_URL || "https://ignite.abacusai.cloud";

// POST /api/ignite-panic/resolve   body: { id: number }
// Server-side proxy to Ignite's service-auth resolve endpoint.
export async function POST(req: Request) {
  const key = process.env.PANIC_SVC_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }
  let id: number | undefined;
  try {
    const body = await req.json();
    id = Number(body?.id);
  } catch {
    id = undefined;
  }
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ ok: false, error: "bad_id" }, { status: 400 });
  }
  try {
    const res = await fetch(`${IGNITE_BASE_URL}/api/panic/${id}/resolve-svc`, {
      method: "POST",
      headers: { "X-Panic-Key": key },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "network" }, { status: 502 });
  }
}
