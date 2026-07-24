import { ShopShell } from "@/components/shop/ShopShell";
import { requireUser } from "@/lib/require-user";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/shop");
  return <ShopShell>{children}</ShopShell>;
}
