import { NextRequest, NextResponse } from "next/server";
import { safeRead, writeToGitHub } from "@/lib/github";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file, fileName, prefix } = body; // Base64 raw representation "data:image/png;base64,..."
    if (!file || !fileName) {
      return NextResponse.json({ ok: false, error: "Missing file payload or name" }, { status: 400 });
    }

    // Extract Base64 binary payload
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ ok: false, error: "Invalid base64 payload format" }, { status: 400 });
    }

    const fileType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Enforce folder names
    const pre = prefix ? `${prefix}-` : "msg-";
    const cleanName = `${pre}${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    
    // Save locally
    const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(publicUploadsDir)) {
      fs.mkdirSync(publicUploadsDir, { recursive: true });
    }
    const localFilePath = path.join(publicUploadsDir, cleanName);
    fs.writeFileSync(localFilePath, buffer);

    // Save to GitHub repo directly inside public/uploads/
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

    // Upload payload
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
      console.error(`[github upload] PUT failed with status: ${res.status}. Fallback to local-only.`);
    }

    return NextResponse.json({
      ok: true,
      url: `/uploads/${cleanName}`
    });
  } catch (err) {
    console.error("Upload handler failed:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
