import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// SVG deliberately excluded: it can carry inline <script> and, served
// same-origin, would run as stored XSS. Only raster formats are accepted.
//
// The extension comes from this table, never from the uploaded filename —
// otherwise a request declaring type=image/png while named "x.html" would be
// written as .html and served back as markup.
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const MAX_SIZE = 4 * 1024 * 1024; // 4MB

// file.type is client-supplied, so confirm the bytes match before trusting it.
function sniffMimeType(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (bytes.length >= 6 && bytes.subarray(0, 6).toString("ascii").match(/^GIF8[79]a$/)) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Uploads only feed the admin product form. Any signed-in customer — including
  // the passwordless guest-checkout shadow accounts — used to pass this check.
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const rl = rateLimit({
    key: `upload:${session.user.id ?? (await clientIp())}`,
    limit: 60,
    windowMs: 15 * 60_000,
  });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES[file.type]) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 4MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffMimeType(bytes);

  if (!sniffed || sniffed !== file.type) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${crypto.randomUUID()}${ALLOWED_TYPES[sniffed]}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await writeFile(filepath, bytes);

  return NextResponse.json({ url: `/api/uploads/${filename}` });
}
