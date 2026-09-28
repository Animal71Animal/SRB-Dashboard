import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file, fileName, prefix } = body;
    if (!file || !fileName) {
      return NextResponse.json({ ok: false, error: "Missing file payload or name" }, { status: 400 });
    }

    // Extract Base64 binary payload
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ ok: false, error: "Invalid base64 payload format" }, { status: 400 });
    }

    const base64Data = matches[2];

    // Enforce folder names and keep characters clean for raw URL matching
    const pre = prefix ? `${prefix}-` : "msg-";
    const cleanName = `${pre}${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

    // Upload directly to GitHub repository inside public/uploads/
    const ghFilePath = `public/uploads/${cleanName}`;
    const url = `https://api.github.com/repos/${process.env.GITHUB_REPO || "Animal71Animal/SRB-Dashboard"}/contents/${ghFilePath}`;
    
    const h: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };
    if (process.env.GITHUB_TOKEN) {
      h["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const putBody = JSON.stringify({
      message: `upload: add media asset ${cleanName}`,
      content: base64Data,
      branch: "main",
    });

    console.error(`[github upload] PUT ${url}`);
    const res = await fetch(url, {
      method: "PUT",
      headers: h,
      body: putBody,
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`[github upload] PUT failed with status: ${res.status}`);
      return NextResponse.json({ ok: false, error: `GitHub upload rejected: ${res.status}` }, { status: 502 });
    }

    // Since Vercel Serverless environment `/var/task` is read-only, we bypass the local filesystem completely.
    // We construct the direct Vercel static asset path. After GitHub safeWrite, the Next.js static asset map 
    // serving `/uploads/${cleanName}` is available instantly on production once GitHub resolves, or
    // we fallback to raw.githubusercontent.com for immediate real-time loading:
    const finalUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_REPO || "Animal71Animal/SRB-Dashboard"}/refs/heads/main/public/uploads/${cleanName}`;

    return NextResponse.json({
      ok: true,
      url: finalUrl
    });
  } catch (err) {
    console.error("Upload handler failed:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
