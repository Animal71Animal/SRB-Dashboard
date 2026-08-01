/**
 * GitHub API data layer for SRB Dashboard.
 * Reads/writes JSON files directly in the GitHub repo.
 */

import fs from "fs";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "Animal71Animal/SRB-Dashboard";
const GITHUB_BRANCH = "main";

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
  if (GITHUB_TOKEN) h["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

function apiUrl(filePath: string) {
  return `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
}

export async function readFromGitHub<T>(filePath: string): Promise<{ data: T; sha: string }> {
  const res = await fetch(apiUrl(filePath), {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub GET ${filePath} failed: ${res.status}`);
  const json = await res.json();
  const data: T = JSON.parse(Buffer.from(json.content, "base64").toString("utf-8"));
  return { data, sha: json.sha };
}

export async function writeToGitHub<T>(
  filePath: string,
  data: T,
  sha: string,
  message: string
): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
      sha,
      branch: GITHUB_BRANCH,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub PUT ${filePath} failed: ${res.status} ${txt}`);
  }
}

// Local fallback helpers
function localPath(filePath: string) {
  return path.join(process.cwd(), "public", "data", filePath);
}

export function readLocal<T>(filePath: string): T | null {
  try {
    const p = localPath(filePath);
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch (e) {
    console.error(`[local read] ${filePath}:`, e);
  }
  return null;
}

export function writeLocal<T>(filePath: string, data: T): void {
  try {
    const p = localPath(filePath);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`[local write] ${filePath}:`, e);
  }
}

/** Read from GitHub, fall back to local */
export async function safeRead<T>(filePath: string, fallback: T): Promise<{ data: T; sha: string }> {
  try {
    return await readFromGitHub<T>(filePath);
  } catch {
    const local = readLocal<T>(filePath);
    return { data: local ?? fallback, sha: "" };
  }
}

/** Write to GitHub and local */
export async function safeWrite<T>(filePath: string, data: T, sha: string, message: string): Promise<void> {
  if (sha) await writeToGitHub(filePath, data, sha, message);
  writeLocal(filePath, data);
}
