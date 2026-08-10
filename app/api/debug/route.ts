import { NextResponse } from "next/server";

export async function GET() {
  const gh = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  
  if (!gh) return NextResponse.json({ error: "No GITHUB_TOKEN set" });
  
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo || "Animal71Animal/SRB-Dashboard"}/contents/public/data/srb-hours.json?ref=main`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: `Bearer ${gh}`,
        },
        cache: "no-store",
      }
    );
    
    const text = await res.text();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      tokenLen: gh.length,
      tokenPrefix: gh.substring(0, 6),
      bodyPreview: text.substring(0, 300),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
