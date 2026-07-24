import "server-only";

import sharp from "sharp";

const MAX_BYTES = 12 * 1024 * 1024;
const MAX_EDGE = 1600;

export async function prepareUploadedImage(buffer: Buffer): Promise<{
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
  ext: "webp" | "jpg";
}> {
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("Файл слишком большой (макс. 12 МБ)");
  }

  const image = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) throw new Error("Не удалось прочитать изображение");

  const resized = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  try {
    const out = await resized.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    return {
      buffer: out.data,
      mimeType: "image/webp",
      width: out.info.width,
      height: out.info.height,
      ext: "webp",
    };
  } catch {
    const out = await resized.jpeg({ quality: 85 }).toBuffer({ resolveWithObject: true });
    return {
      buffer: out.data,
      mimeType: "image/jpeg",
      width: out.info.width,
      height: out.info.height,
      ext: "jpg",
    };
  }
}
