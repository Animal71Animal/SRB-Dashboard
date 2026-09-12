import { NextResponse } from "next/server";

// Always hit the live Ignite backend — never cache panic state.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const IGNITE_BASE_URL = process.env.IGNITE_BASE_URL || "https://ignite.abacusai.cloud";

// GET /api/ignite-panic/active
// Server-side proxy to Ignite's service-auth active-panic endpoint. The shared
// secret (PANIC_SVC_KEY) never reaches the browser — this runs on the server.
export async function GET() {
  const key = process.env.PANIC_SVC_KEY;
  if (!key) {
    // Misconfiguration — fail closed with an empty list so the UI never alarms falsely.
    return NextResponse.json([], { status: 200 });
  }
  try {
    const res = await fetch(`${IGNITE_BASE_URL}/api/panic/active-svc`, {
      method: "GET",
      headers: { "X-Panic-Key": key },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : [], { status: 200 });
  } catch {
    // Network hiccup — return empty so a transient failure never triggers a false alarm.
    return NextResponse.json([], { status: 200 });
  }
}
