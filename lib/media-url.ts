/**
 * Файлы в public/uploads, отдача через /api/media (иначе свежие загрузки 404 после билда).
 */
function mediaApiPathFromRelativeKey(key: string): string {
  const clean = key.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  return `/api/media/${clean}`;
}

export function resolveUploadedMediaSrc(
  publicUrl: string | null | undefined,
  storageKey?: string | null
): string | null {
  const key = storageKey?.trim().replace(/^\/+/, "").replace(/\\/g, "/");
  if (key) return mediaApiPathFromRelativeKey(key);

  const u = publicUrl?.trim() ?? "";
  if (!u) return null;
  if (u.startsWith("/api/media/")) return u;
  if (u.startsWith("/uploads/")) {
    return mediaApiPathFromRelativeKey(u.slice("/uploads/".length));
  }
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return u;
}
