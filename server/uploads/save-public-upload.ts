import { randomUUID } from "crypto";
import { mkdir, rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { PUBLIC_UPLOADS_DIR } from "@/server/uploads/public-uploads-root";

function normalizedUploadPath(relativePath: string): string {
  return relativePath.replace(/^\/+/, "").replace(/\\/g, "/");
}

export function relativePathFromPublicUploadUrl(url: string): string | null {
  const u = url.trim();
  if (u.startsWith("/api/media/")) return normalizedUploadPath(u.slice("/api/media/".length));
  if (u.startsWith("/uploads/")) return normalizedUploadPath(u.slice("/uploads/".length));
  return null;
}

/** Сохраняет в public/uploads. URL для БД: /api/media/… */
export async function savePublicUpload(relativePath: string, buffer: Buffer): Promise<string> {
  const normalized = normalizedUploadPath(relativePath);
  const fullPath = path.join(PUBLIC_UPLOADS_DIR, normalized);
  const dir = path.dirname(fullPath);
  await mkdir(dir, { recursive: true });
  const tmpPath = path.join(dir, `.${randomUUID()}.upload.tmp`);
  await writeFile(tmpPath, buffer);
  await rename(tmpPath, fullPath);
  return `/api/media/${normalized}`;
}

export async function deletePublicUploadFile(relativePath: string): Promise<void> {
  const normalized = normalizedUploadPath(relativePath);
  const fullPath = path.join(PUBLIC_UPLOADS_DIR, normalized);
  try {
    await unlink(fullPath);
  } catch {
    /* ignore */
  }
}
