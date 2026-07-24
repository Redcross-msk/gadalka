import path from "path";

/** Корень загрузок на диске (вне билда Next — читаем через /api/media). */
export const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
