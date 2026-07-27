"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ProductCategory,
  ProductStatus,
  UserStatus,
  SubscriptionPlan,
  ZodiacSign,
} from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { prepareUploadedImage } from "@/server/media/prepare-uploaded-image";
import { savePublicUpload, deletePublicUploadFile } from "@/server/uploads/save-public-upload";
import { logAdminAction } from "@/server/services/admin.service";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session.user;
}

const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug: латиница, цифры, дефис"),
  description: z.string().min(5).max(10000),
  priceRub: z.coerce.number().min(0),
  category: z.nativeEnum(ProductCategory),
  status: z.nativeEnum(ProductStatus),
  digitalBonus: z.string().optional(),
  composition: z.string().optional(),
  stock: z.coerce.number().int().optional().nullable(),
});

export async function adminUpsertProductAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceRub: formData.get("priceRub"),
    category: formData.get("category"),
    status: formData.get("status"),
    digitalBonus: formData.get("digitalBonus") || undefined,
    composition: formData.get("composition") || undefined,
    stock: formData.get("stock") === "" ? null : formData.get("stock"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.errors[0]?.message ?? "Ошибка" };
  }

  const data = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    priceCents: Math.round(parsed.data.priceRub * 100),
    category: parsed.data.category,
    status: parsed.data.status,
    digitalBonus: parsed.data.digitalBonus || null,
    composition: parsed.data.composition || null,
    stock: parsed.data.stock ?? null,
  };

  let productId = id;
  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    const created = await prisma.product.create({ data });
    productId = created.id;
  }

  const galleryResult = await syncProductGallery({
    productId,
    formData,
    productName: parsed.data.name,
    uploadedById: admin.id,
    isCreate: !id,
  });
  if (!galleryResult.ok) {
    if (!id) {
      await prisma.product.delete({ where: { id: productId } }).catch(() => undefined);
    }
    return galleryResult;
  }

  await logAdminAction({
    adminId: admin.id,
    action: id ? "admin.product.update" : "admin.product.create",
    entity: "Product",
    entityId: productId,
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop", "layout");
  return { ok: true as const, id: productId };
}

type GalleryMetaItem =
  | { type: "existing"; id: string; sortOrder: number }
  | { type: "legacy-cover"; mediaId: string; sortOrder: number }
  | { type: "new"; sortOrder: number };

async function syncProductGallery(opts: {
  productId: string;
  formData: FormData;
  productName: string;
  uploadedById: string;
  isCreate: boolean;
}) {
  const rawMeta = opts.formData.get("galleryMeta");
  // Old clients / partial submits without galleryMeta: leave media untouched
  if (typeof rawMeta !== "string") {
    if (opts.isCreate) {
      return { ok: false as const, error: "Добавьте хотя бы одно фото товара" };
    }
    return { ok: true as const };
  }

  let meta: GalleryMetaItem[];
  try {
    const parsed = JSON.parse(rawMeta) as unknown;
    if (!Array.isArray(parsed)) throw new Error("bad meta");
    meta = parsed as GalleryMetaItem[];
  } catch {
    return { ok: false as const, error: "Некорректные данные галереи" };
  }

  const newFiles = opts.formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (meta.length === 0) {
    return { ok: false as const, error: "Добавьте хотя бы одно фото товара" };
  }

  const expectedNewCount = meta.filter((m) => m.type === "new").length;
  if (expectedNewCount !== newFiles.length) {
    return { ok: false as const, error: "Не удалось сопоставить новые фото" };
  }

  const current = await prisma.product.findUnique({
    where: { id: opts.productId },
    include: { images: { include: { media: true } }, coverMedia: true },
  });
  if (!current) return { ok: false as const, error: "Товар не найден" };

  const keepImageIds = new Set(
    meta.filter((m): m is Extract<GalleryMetaItem, { type: "existing" }> => m.type === "existing").map((m) => m.id)
  );
  const keepLegacyCover =
    meta.some((m) => m.type === "legacy-cover") && Boolean(current.coverMediaId);

  const mediaIdsInUse = new Set<string>();
  for (const m of meta) {
    if (m.type === "existing") {
      const row = current.images.find((img) => img.id === m.id);
      if (row) mediaIdsInUse.add(row.mediaId);
    }
    if (m.type === "legacy-cover") mediaIdsInUse.add(m.mediaId);
  }

  // Detach cover before deleting media that might be referenced by coverMediaId
  await prisma.product.update({
    where: { id: opts.productId },
    data: { coverMediaId: null },
  });

  for (const img of current.images) {
    if (keepImageIds.has(img.id)) continue;
    await prisma.productImage.delete({ where: { id: img.id } });
    if (!mediaIdsInUse.has(img.mediaId)) {
      if (img.media.path) await deletePublicUploadFile(img.media.path);
      await prisma.mediaAsset.delete({ where: { id: img.mediaId } }).catch(() => undefined);
    }
  }

  if (
    current.coverMediaId &&
    current.coverMedia &&
    !keepLegacyCover &&
    !mediaIdsInUse.has(current.coverMediaId) &&
    !current.images.some((img) => img.mediaId === current.coverMediaId && keepImageIds.has(img.id))
  ) {
    // Cover was only on product (no ProductImage) and was removed from gallery
    const stillLinked = await prisma.productImage.findFirst({
      where: { mediaId: current.coverMediaId },
    });
    if (!stillLinked) {
      if (current.coverMedia.path) await deletePublicUploadFile(current.coverMedia.path);
      await prisma.mediaAsset.delete({ where: { id: current.coverMediaId } }).catch(() => undefined);
    }
  }

  let newFileIndex = 0;
  const orderedMediaIds: string[] = [];

  for (const item of meta) {
    if (item.type === "existing") {
      const row = current.images.find((img) => img.id === item.id);
      if (!row) return { ok: false as const, error: "Фото галереи не найдено" };
      await prisma.productImage.update({
        where: { id: row.id },
        data: { sortOrder: item.sortOrder },
      });
      orderedMediaIds.push(row.mediaId);
      continue;
    }

    if (item.type === "legacy-cover") {
      const mediaId = item.mediaId;
      const existingLink = await prisma.productImage.findFirst({
        where: { productId: opts.productId, mediaId },
      });
      if (existingLink) {
        await prisma.productImage.update({
          where: { id: existingLink.id },
          data: { sortOrder: item.sortOrder },
        });
      } else {
        await prisma.productImage.create({
          data: {
            productId: opts.productId,
            mediaId,
            sortOrder: item.sortOrder,
          },
        });
        await prisma.mediaAsset.update({
          where: { id: mediaId },
          data: { kind: "PRODUCT_GALLERY", ownerType: "PRODUCT", ownerId: opts.productId },
        }).catch(() => undefined);
      }
      orderedMediaIds.push(mediaId);
      continue;
    }

    const file = newFiles[newFileIndex++];
    const buf = Buffer.from(await file.arrayBuffer());
    const prepared = await prepareUploadedImage(buf);
    const key = `products/${opts.productId}/${randomUUID()}.${prepared.ext}`;
    const url = await savePublicUpload(key, prepared.buffer);

    const media = await prisma.mediaAsset.create({
      data: {
        kind: "PRODUCT_GALLERY",
        ownerType: "PRODUCT",
        ownerId: opts.productId,
        url,
        path: key,
        mimeType: prepared.mimeType,
        width: prepared.width,
        height: prepared.height,
        sizeBytes: prepared.buffer.byteLength,
        uploadedById: opts.uploadedById,
        alt: opts.productName,
        sortOrder: item.sortOrder,
      },
    });

    await prisma.productImage.create({
      data: {
        productId: opts.productId,
        mediaId: media.id,
        sortOrder: item.sortOrder,
      },
    });
    orderedMediaIds.push(media.id);
  }

  const coverMediaId = orderedMediaIds[0] ?? null;
  await prisma.product.update({
    where: { id: opts.productId },
    data: { coverMediaId },
  });

  if (coverMediaId) {
    await prisma.mediaAsset
      .update({
        where: { id: coverMediaId },
        data: { kind: "PRODUCT" },
      })
      .catch(() => undefined);
  }

  return { ok: true as const };
}

export async function adminDeleteProductAction(productId: string) {
  const admin = await requireAdmin();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { coverMedia: true, images: { include: { media: true } } },
  });
  if (!product) return { ok: false as const, error: "Не найден" };

  for (const img of product.images) {
    if (img.media.path) await deletePublicUploadFile(img.media.path);
  }
  if (product.coverMedia?.path) await deletePublicUploadFile(product.coverMedia.path);

  await prisma.product.delete({ where: { id: productId } });
  await logAdminAction({
    adminId: admin.id,
    action: "admin.product.delete",
    entity: "Product",
    entityId: productId,
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true as const };
}

export async function adminUpdateUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") || "");
  if (!userId) return;

  const displayName = String(formData.get("displayName") || "").trim();
  const status = String(formData.get("status") || "ACTIVE") as UserStatus;
  const plan = String(formData.get("plan") || "FREE") as SubscriptionPlan;
  const zodiacRaw = String(formData.get("zodiacSign") || "");
  const birthPlace = String(formData.get("birthPlace") || "").trim();
  const birthTime = String(formData.get("birthTime") || "").trim();
  const birthDate = String(formData.get("birthDate") || "");

  if (userId === admin.id && status === "SUSPENDED") return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: Object.values(UserStatus).includes(status) ? status : "ACTIVE",
      profile: {
        update: {
          displayName: displayName || undefined,
          birthPlace: birthPlace || undefined,
          birthTime: birthTime || undefined,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          zodiacSign:
            zodiacRaw && Object.values(ZodiacSign).includes(zodiacRaw as ZodiacSign)
              ? (zodiacRaw as ZodiacSign)
              : undefined,
        },
      },
      subscription: {
        upsert: {
          create: { plan, status: "ACTIVE" },
          update: { plan },
        },
      },
    },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "admin.user.update",
    entity: "User",
    entityId: userId,
    meta: { status, plan },
  });

  revalidatePath("/admin/users");
  revalidatePath("/platform");
  revalidatePath("/game");
}

export async function adminSetUserStatusAction(userId: string, status: UserStatus) {
  const admin = await requireAdmin();
  if (userId === admin.id) return { ok: false as const, error: "Нельзя менять свой статус так" };

  await prisma.user.update({ where: { id: userId }, data: { status } });
  await logAdminAction({
    adminId: admin.id,
    action: status === "SUSPENDED" ? "admin.user.block" : "admin.user.unblock",
    entity: "User",
    entityId: userId,
  });
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function adminDeleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return { ok: false as const, error: "Нельзя удалить себя" };

  await prisma.user.delete({ where: { id: userId } });
  await logAdminAction({
    adminId: admin.id,
    action: "admin.user.delete",
    entity: "User",
    entityId: userId,
  });
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function adminCreateActivationCodeAction(formData: FormData) {
  const admin = await requireAdmin();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const bonusType = String(formData.get("bonusType") || "PREMIUM_DAYS");
  const bonusValue = String(formData.get("bonusValue") || "7");
  const maxUses = Number(formData.get("maxUses") || 100);
  const note = String(formData.get("note") || "").trim() || null;

  if (!code) return;

  if (bonusType === "SHOP_DISCOUNT") {
    const percent = Number.parseInt(bonusValue, 10);
    if (!Number.isFinite(percent) || percent < 1 || percent > 100) {
      return;
    }
  }

  await prisma.activationCode.create({
    data: {
      code,
      bonusType: bonusType as never,
      bonusValue,
      maxUses,
      active: true,
      note,
    },
  });
  await logAdminAction({
    adminId: admin.id,
    action: "admin.activation.create",
    entity: "ActivationCode",
    meta: { code, bonusType, bonusValue },
  });
  revalidatePath("/admin/activations");
}
