"use server";

import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { mapDbProductsToApp } from "@/lib/mappers/product";
import type { Product } from "@/types";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

export async function listProductsAction() {
  return prisma.product.findMany({
    where: { status: { in: ["IN_STOCK", "PREORDER", "DIGITAL"] } },
    include: {
      coverMedia: true,
      images: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function listShopProductsMappedAction(): Promise<Product[]> {
  const db = await listProductsAction();
  return mapDbProductsToApp(db);
}

export async function getProductBySlugAction(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      coverMedia: true,
      images: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function addToCartAction(productId: string, quantity = 1) {
  const userId = await requireUserId();
  const product = await prisma.product.findFirst({
    where: { id: productId, status: { in: ["IN_STOCK", "PREORDER", "DIGITAL"] } },
  });
  if (!product) return { ok: false as const, error: "Товар недоступен" };

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity: Math.max(1, quantity) },
    update: { quantity: { increment: Math.max(1, quantity) } },
  });
  return { ok: true as const };
}

export async function getCartAction() {
  const userId = await requireUserId();
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          coverMedia: true,
          images: { include: { media: true }, orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateCartQuantityAction(productId: string, quantity: number) {
  const userId = await requireUserId();
  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    }).catch(() => undefined);
    return { ok: true as const };
  }
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity },
    update: { quantity },
  });
  return { ok: true as const };
}

export async function removeFromCartAction(productId: string) {
  const userId = await requireUserId();
  await prisma.cartItem.delete({
    where: { userId_productId: { userId, productId } },
  }).catch(() => undefined);
  return { ok: true as const };
}

export async function clearCartAction() {
  const userId = await requireUserId();
  await prisma.cartItem.deleteMany({ where: { userId } });
  return { ok: true as const };
}

/** Полная синхронизация корзины: сервер = источник истины после вызова */
export async function replaceCartAction(
  items: Array<{ productId: string; quantity: number }>
) {
  const userId = await requireUserId();
  const cleaned = items
    .filter((i) => i.productId && i.quantity > 0)
    .map((i) => ({ productId: i.productId, quantity: Math.min(99, Math.floor(i.quantity)) }));

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { userId } });
    for (const item of cleaned) {
      const product = await tx.product.findFirst({
        where: { id: item.productId, status: { in: ["IN_STOCK", "PREORDER", "DIGITAL"] } },
        select: { id: true },
      });
      if (!product) continue;
      await tx.cartItem.create({
        data: { userId, productId: item.productId, quantity: item.quantity },
      });
    }
  });

  return getCartAction();
}

export type CartLineDto = {
  productSlug: string;
  productId: string;
  quantity: number;
  product: Product;
};

export async function getResolvedCartAction(): Promise<CartLineDto[]> {
  const rows = await getCartAction();
  const out: CartLineDto[] = [];
  for (const row of rows) {
    const mapped = mapDbProductsToApp([
      {
        ...row.product,
        coverMedia: row.product.coverMedia,
        images: row.product.images,
      },
    ]);
    const product = mapped[0];
    if (!product) continue;
    out.push({
      productSlug: product.slug,
      productId: row.productId,
      quantity: row.quantity,
      product,
    });
  }
  return out;
}

function parseDiscountPercent(bonusValue: string): number | null {
  const n = Number.parseInt(bonusValue.trim(), 10);
  if (!Number.isFinite(n) || n < 1 || n > 100) return null;
  return n;
}

export async function applyShopPromoAction(rawCode: string) {
  const userId = await requireUserId();
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false as const, error: "Введите промокод" };

  const row = await prisma.activationCode.findUnique({
    where: { code },
    include: { redemptions: { where: { userId }, take: 1 } },
  });

  if (!row || !row.active) {
    return { ok: false as const, error: "Промокод не найден или неактивен" };
  }
  if (row.bonusType !== "SHOP_DISCOUNT") {
    return { ok: false as const, error: "Этот код не для скидки в магазине" };
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, error: "Срок действия промокода истёк" };
  }
  if (row.assignedUserId && row.assignedUserId !== userId) {
    return { ok: false as const, error: "Промокод принадлежит другому пользователю" };
  }
  if (row.usedCount >= row.maxUses && row.redemptions.length === 0) {
    return { ok: false as const, error: "Промокод уже исчерпан" };
  }

  const percent = parseDiscountPercent(row.bonusValue);
  if (!percent) {
    return { ok: false as const, error: "Некорректная скидка промокода" };
  }

  return {
    ok: true as const,
    promo: {
      code: row.code,
      percent,
      label: row.note || `Скидка ${percent}%`,
    },
  };
}

export async function listMyShopPromosAction() {
  const userId = await requireUserId();
  const rows = await prisma.activationCode.findMany({
    where: {
      assignedUserId: userId,
      bonusType: "SHOP_DISCOUNT",
      active: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return rows
    .map((r) => {
      const percent = parseDiscountPercent(r.bonusValue);
      if (!percent) return null;
      return {
        code: r.code,
        percent,
        source: r.source,
        note: r.note,
        usedCount: r.usedCount,
        maxUses: r.maxUses,
      };
    })
    .filter(Boolean) as Array<{
    code: string;
    percent: number;
    source: string | null;
    note: string | null;
    usedCount: number;
    maxUses: number;
  }>;
}

function makePromoCode(level: number): string {
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `TAROT${level}-${suffix}`;
}

/** Выдать/вернуть промокод за открытый Таро-центр (1%…5%) */
export async function ensureTarotCenterPromosAction(tarotCenterLevel: number) {
  const userId = await requireUserId();
  const level = Math.max(0, Math.min(5, Math.floor(tarotCenterLevel)));
  if (level < 1) return { ok: true as const, codes: [] as Array<{ level: number; code: string; percent: number }> };

  const created: Array<{ level: number; code: string; percent: number }> = [];

  for (let n = 1; n <= level; n++) {
    const source = `tarot_center:${n}`;
    const existing = await prisma.activationCode.findFirst({
      where: { assignedUserId: userId, source },
    });
    if (existing) {
      const percent = parseDiscountPercent(existing.bonusValue) ?? n;
      created.push({ level: n, code: existing.code, percent });
      continue;
    }

    let code = makePromoCode(n);
    for (let attempt = 0; attempt < 5; attempt++) {
      const clash = await prisma.activationCode.findUnique({ where: { code } });
      if (!clash) break;
      code = makePromoCode(n);
    }

    const row = await prisma.activationCode.create({
      data: {
        code,
        bonusType: "SHOP_DISCOUNT",
        bonusValue: String(n),
        maxUses: 1,
        active: true,
        assignedUserId: userId,
        source,
        note: `Награда: Таро-центр ${n} (−${n}%)`,
      },
    });
    created.push({ level: n, code: row.code, percent: n });
  }

  return { ok: true as const, codes: created };
}

export async function grantTarotCenterPromoAction(level: number) {
  const res = await ensureTarotCenterPromosAction(level);
  if (!res.ok) return { ok: false as const, error: "Не удалось выдать промокод" };
  const match = res.codes.find((c) => c.level === level);
  if (!match) return { ok: false as const, error: "Уровень центра неверный" };
  return { ok: true as const, code: match.code, percent: match.percent };
}
