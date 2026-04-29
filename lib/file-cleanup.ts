import { unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

function isUploadUrl(url: string): boolean {
  return typeof url === "string" && url.startsWith("/api/uploads/");
}

function urlToFilename(url: string): string | null {
  if (!isUploadUrl(url)) return null;
  const filename = url.slice("/api/uploads/".length);
  if (!filename || filename.includes("..") || filename.includes("/")) return null;
  return filename;
}

export async function deleteUploadedImages(urls: (string | null | undefined)[]): Promise<void> {
  await Promise.all(
    urls
      .filter((u): u is string => !!u)
      .map(async (url) => {
        const filename = urlToFilename(url);
        if (!filename) return;
        const filepath = path.join(UPLOAD_DIR, filename);
        if (!filepath.startsWith(UPLOAD_DIR)) return;
        try {
          await unlink(filepath);
        } catch {
          // best-effort: file may already be gone
        }
      })
  );
}

export function diffImages(oldList: string[], newList: string[]): string[] {
  const newSet = new Set(newList);
  return oldList.filter((u) => !newSet.has(u));
}
