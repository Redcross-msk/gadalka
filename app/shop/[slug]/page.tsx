import { notFound } from "next/navigation";
import { getProductBySlugAction } from "@/features/shop/actions";
import { mapDbProductToApp } from "@/lib/mappers/product";
import { getProductBySlug } from "@/data/products";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product = null;
  try {
    const db = await getProductBySlugAction(slug);
    if (db) product = mapDbProductToApp(db);
  } catch {
    /* fallback */
  }

  if (!product) {
    product = getProductBySlug(slug) ?? null;
  }

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
