import { NextResponse } from "next/server";

export async function GET() {
  const gh = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || "Animal71Animal/SRB-Dashboard";
  
  if (!gh) return NextResponse.json({ error: "No GITHUB_TOKEN set" });
  
  const url = `https://api.github.com/repos/${repo}/contents/public/data/srb-hours.json?ref=main`;
  
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        Authorization: `Bearer ${gh}`,
      },
      cache: "no-store",
    });
    
    const text = await res.text();
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch {}
    
    return NextResponse.json({
      url,
      status: res.status,
      ok: res.ok,
      hasContent: !!parsed.content,
      sha: parsed.sha?.substring(0, 12) || "none",
      message: parsed.message || "none",
      repo,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, url });
  }
}
