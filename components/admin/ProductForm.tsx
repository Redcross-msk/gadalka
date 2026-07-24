"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpsertProductAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product, MediaAsset, ProductCategory, ProductStatus } from "@prisma/client";
import { resolveUploadedMediaSrc } from "@/lib/media-url";

const categories: ProductCategory[] = [
  "CARDS",
  "CANDLES",
  "ACCESSORIES",
  "GIFT_SETS",
  "BOARD_GAMES",
  "DIGITAL",
];

const statuses: ProductStatus[] = ["DRAFT", "IN_STOCK", "PREORDER", "DIGITAL", "ARCHIVED"];

type ProductWithCover = Product & { coverMedia: MediaAsset | null };

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, "")
    .replace(/[а-яё]/gi, (ch) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
        и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
        с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
        ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[ch] ?? "";
    })
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProductForm({ product }: { product: ProductWithCover | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [preview, setPreview] = useState<string | null>(
    resolveUploadedMediaSrc(product?.coverMedia?.url, product?.coverMedia?.path)
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    if (product?.id) fd.set("id", product.id);
    startTransition(async () => {
      const res = await adminUpsertProductAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" encType="multipart/form-data">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">Название</Label>
          <Input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!product) setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priceRub">Цена, ₽</Label>
          <Input
            id="priceRub"
            name="priceRub"
            type="number"
            min={0}
            step="1"
            required
            defaultValue={product ? Math.round(product.priceCents / 100) : 0}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Категория</Label>
          <select
            id="category"
            name="category"
            defaultValue={product?.category ?? "CARDS"}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Статус</Label>
          <select
            id="status"
            name="status"
            defaultValue={product?.status ?? "IN_STOCK"}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={product?.description ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="digitalBonus">Цифровой бонус</Label>
          <Input id="digitalBonus" name="digitalBonus" defaultValue={product?.digitalBonus ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Остаток (шт)</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            defaultValue={product?.stock ?? ""}
            placeholder="необяз."
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="composition">Состав / характеристики</Label>
          <Textarea
            id="composition"
            name="composition"
            rows={2}
            defaultValue={product?.composition ?? ""}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="image">Фото товара {product ? "(заменит текущее)" : "*"}</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Превью"
              className="mt-2 h-40 w-full max-w-sm object-cover rounded-lg border border-gold/20"
            />
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            С телефона можно сразу снять фото. Сохраняется как WebP через /api/media.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive border border-destructive/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Сохранение…" : "Сохранить товар"}
      </Button>
    </form>
  );
}
