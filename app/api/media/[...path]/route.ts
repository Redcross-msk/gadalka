import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { PUBLIC_UPLOADS_DIR } from "@/server/uploads/public-uploads-root";

export const runtime = "nodejs";

function allowedTopSegment(seg: string): boolean {
  return ["products", "banners", "avatars", "content", "placeholders"].includes(seg);
}

function contentTypeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

async function resolveUploadFile(rel: string) {
  if (!rel || rel.includes("..")) return null;
  const first = rel.split("/")[0] ?? "";
  if (!allowedTopSegment(first)) return null;

  const resolvedRoot = path.resolve(PUBLIC_UPLOADS_DIR);
  const fullPath = path.resolve(path.join(PUBLIC_UPLOADS_DIR, rel));
  if (!fullPath.startsWith(resolvedRoot + path.sep) && fullPath !== resolvedRoot) {
    return null;
  }

  try {
    const s = await stat(fullPath);
    if (!s.isFile()) return null;
    const ext = path.extname(fullPath).replace(/^\./, "");
    return { fullPath, size: s.size, ext };
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await ctx.params;
  const rel = (parts ?? []).join("/");
  const file = await resolveUploadFile(rel);
  if (!file) return new NextResponse("Not found", { status: 404 });

  const type = contentTypeForExt(file.ext);
  const stream = createReadStream(file.fullPath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Length": String(file.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
