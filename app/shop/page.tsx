import { listProductsAction } from "@/features/shop/actions";
import { mapDbProductsToApp } from "@/lib/mappers/product";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { products as staticProducts } from "@/data/products";

export default async function ShopPage() {
  let products = staticProducts;
  try {
    const db = await listProductsAction();
    const mapped = mapDbProductsToApp(db);
    if (mapped.length > 0) products = mapped;
  } catch {
    // fallback на статику, если БД недоступна
  }

  return <ShopCatalog products={products} />;
}
