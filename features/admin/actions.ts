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
import { savePublicUpload, deletePublicUploadFile, relativePathFromPublicUploadUrl } from "@/server/uploads/save-public-upload";
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

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const buf = Buffer.from(await file.arrayBuffer());
    const prepared = await prepareUploadedImage(buf);
    const key = `products/${productId}/${randomUUID()}.${prepared.ext}`;
    const url = await savePublicUpload(key, prepared.buffer);

    const media = await prisma.mediaAsset.create({
      data: {
        kind: "PRODUCT",
        ownerType: "PRODUCT",
        ownerId: productId,
        url,
        path: key,
        mimeType: prepared.mimeType,
        width: prepared.width,
        height: prepared.height,
        sizeBytes: prepared.buffer.byteLength,
        uploadedById: admin.id,
        alt: parsed.data.name,
      },
    });

    const prev = await prisma.product.findUnique({
      where: { id: productId },
      select: { coverMediaId: true, coverMedia: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { coverMediaId: media.id },
    });

    if (prev?.coverMedia?.path) {
      await deletePublicUploadFile(prev.coverMedia.path);
      await prisma.mediaAsset.delete({ where: { id: prev.coverMediaId! } }).catch(() => undefined);
    }
  }

  await logAdminAction({
    adminId: admin.id,
    action: id ? "admin.product.update" : "admin.product.create",
    entity: "Product",
    entityId: productId,
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true as const, id: productId };
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

  if (!code) return;

  await prisma.activationCode.create({
    data: {
      code,
      bonusType: bonusType as never,
      bonusValue,
      maxUses,
      active: true,
    },
  });
  await logAdminAction({
    adminId: admin.id,
    action: "admin.activation.create",
    entity: "ActivationCode",
    meta: { code },
  });
  revalidatePath("/admin/activations");
}

/** unused import guard — keep relativePath helper available for future gallery */
void relativePathFromPublicUploadUrl;
