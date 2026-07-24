"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

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
  return prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity },
    update: { quantity: { increment: quantity } },
  });
}

export async function getCartAction() {
  const userId = await requireUserId();
  return prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { coverMedia: true } } },
  });
}

export async function updateCartQuantityAction(productId: string, quantity: number) {
  const userId = await requireUserId();
  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });
    return null;
  }
  return prisma.cartItem.update({
    where: { userId_productId: { userId, productId } },
    data: { quantity },
  });
}

export async function clearCartAction() {
  const userId = await requireUserId();
  await prisma.cartItem.deleteMany({ where: { userId } });
  return { ok: true as const };
}
