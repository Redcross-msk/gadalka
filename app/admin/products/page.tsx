import Link from "next/link";
import { prisma } from "@/lib/db";
import { resolveUploadedMediaSrc } from "@/lib/media-url";
import { adminDeleteProductAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string }>;
}) {
  const sp = await searchParams;
  const products = await prisma.product.findMany({
    include: { coverMedia: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  const editing = sp.edit
    ? products.find((p) => p.id === sp.edit) ?? null
    : sp.new === "1"
      ? null
      : undefined;

  const showForm = sp.new === "1" || Boolean(sp.edit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-gold-light">Товары магазина</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Создание, фото, цена, статус — сразу видно пользователям
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products?new=1">+ Товар</Link>
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-gold/20 bg-card/40 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-serif text-lg text-gold/90">
              {editing ? "Редактирование" : "Новый товар"}
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products">Закрыть</Link>
            </Button>
          </div>
          <ProductForm product={editing ?? null} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((p) => {
          const src = resolveUploadedMediaSrc(p.coverMedia?.url, p.coverMedia?.path);
          return (
            <div
              key={p.id}
              className="rounded-xl border border-gold/15 bg-card/30 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/10] bg-black/20">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gold/30 font-serif text-3xl">
                    ✦
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-serif text-lg leading-snug">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.category} · {p.status}
                    </p>
                  </div>
                  <p className="font-serif text-gold shrink-0">
                    {(p.priceCents / 100).toLocaleString("ru-RU")} ₽
                  </p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="flex-1 min-w-[100px]">
                    <Link href={`/admin/products?edit=${p.id}`}>Изменить</Link>
                  </Button>
                  <form
                    action={async () => {
                      "use server";
                      await adminDeleteProductAction(p.id);
                    }}
                    className="flex-1 min-w-[100px]"
                  >
                    <Button type="submit" size="sm" variant="destructive" className="w-full">
                      Удалить
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">Товаров пока нет</p>
      )}
    </div>
  );
}
