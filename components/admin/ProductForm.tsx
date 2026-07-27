"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { adminUpsertProductAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product, MediaAsset, ProductCategory, ProductImage, ProductStatus } from "@prisma/client";
import { resolveUploadedMediaSrc } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const categories: ProductCategory[] = [
  "CARDS",
  "CANDLES",
  "ACCESSORIES",
  "GIFT_SETS",
  "BOARD_GAMES",
  "DIGITAL",
];

const statuses: ProductStatus[] = ["DRAFT", "IN_STOCK", "PREORDER", "DIGITAL", "ARCHIVED"];

type ProductWithMedia = Product & {
  coverMedia: MediaAsset | null;
  images?: (ProductImage & { media: MediaAsset })[];
};

type GalleryItem =
  | {
      key: string;
      type: "existing";
      productImageId: string;
      mediaId: string;
      src: string;
    }
  | {
      key: string;
      type: "legacy-cover";
      mediaId: string;
      src: string;
    }
  | {
      key: string;
      type: "new";
      file: File;
      src: string;
    };

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

function buildInitialGallery(product: ProductWithMedia | null): GalleryItem[] {
  if (!product) return [];

  const images = [...(product.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  if (images.length > 0) {
    return images
      .map((img) => {
        const src = resolveUploadedMediaSrc(img.media.url, img.media.path);
        if (!src) return null;
        return {
          key: img.id,
          type: "existing" as const,
          productImageId: img.id,
          mediaId: img.mediaId,
          src,
        };
      })
      .filter((x): x is Extract<GalleryItem, { type: "existing" }> => Boolean(x));
  }

  const coverSrc = resolveUploadedMediaSrc(product.coverMedia?.url, product.coverMedia?.path);
  if (product.coverMedia && coverSrc) {
    return [
      {
        key: `cover-${product.coverMedia.id}`,
        type: "legacy-cover",
        mediaId: product.coverMedia.id,
        src: coverSrc,
      },
    ];
  }

  return [];
}

export function ProductForm({ product }: { product: ProductWithMedia | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [gallery, setGallery] = useState<GalleryItem[]>(() => buildInitialGallery(product));

  const galleryMeta = useMemo(
    () =>
      gallery.map((item, index) => {
        if (item.type === "existing") {
          return { type: "existing" as const, id: item.productImageId, sortOrder: index };
        }
        if (item.type === "legacy-cover") {
          return { type: "legacy-cover" as const, mediaId: item.mediaId, sortOrder: index };
        }
        return { type: "new" as const, sortOrder: index };
      }),
    [gallery]
  );

  const moveItem = (from: number, to: number) => {
    setGallery((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const removeItem = (index: number) => {
    setGallery((prev) => {
      const item = prev[index];
      if (item?.type === "new") URL.revokeObjectURL(item.src);
      return prev.filter((_, i) => i !== index);
    });
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const additions: GalleryItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        key: `new-${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        type: "new" as const,
        file,
        src: URL.createObjectURL(file),
      }));
    if (additions.length) setGallery((prev) => [...prev, ...additions]);
  };

  const setOrderNumber = (index: number, order: number) => {
    const target = Math.max(1, Math.min(gallery.length, order)) - 1;
    if (target === index) return;
    moveItem(index, target);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!product && gallery.length === 0) {
      setError("Добавьте хотя бы одно фото товара");
      return;
    }

    const fd = new FormData(e.currentTarget);
    if (product?.id) fd.set("id", product.id);
    fd.set("galleryMeta", JSON.stringify(galleryMeta));

    for (const item of gallery) {
      if (item.type === "new") fd.append("images", item.file);
    }

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

        <div className="space-y-3 sm:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <Label htmlFor="images">Фото товара {!product ? "*" : ""}</Label>
              <p className="text-[11px] text-muted-foreground mt-1">
                Несколько фото. №1 — главное на витрине. Можно менять порядок. С телефона: галерея,
                файлы или камера.
              </p>
            </div>
            <label className="inline-flex">
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <span className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm hover:bg-accent">
                <Plus className="h-4 w-4" />
                Добавить фото
              </span>
            </label>
          </div>

          {gallery.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gold/25 bg-card/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Фото ещё не добавлены
            </div>
          ) : (
            <ul className="space-y-2">
              {gallery.map((item, index) => (
                <li
                  key={item.key}
                  className="flex items-center gap-3 rounded-xl border border-gold/15 bg-card/30 p-2 sm:p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-black/20 sm:h-20 sm:w-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-gold/90 px-1.5 py-0.5 text-[10px] font-medium text-black">
                        Главное
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`order-${item.key}`} className="text-xs text-muted-foreground shrink-0">
                        №
                      </Label>
                      <Input
                        id={`order-${item.key}`}
                        type="number"
                        min={1}
                        max={gallery.length}
                        value={index + 1}
                        onChange={(e) => setOrderNumber(index, Number(e.target.value) || 1)}
                        className="h-9 w-16"
                      />
                      <span className="truncate text-xs text-muted-foreground">
                        {item.type === "new" ? item.file.name : "Загружено"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === 0}
                        onClick={() => moveItem(index, index - 1)}
                        aria-label="Выше"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === gallery.length - 1}
                        onClick={() => moveItem(index, index + 1)}
                        aria-label="Ниже"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(index)}
                        aria-label="Удалить фото"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={cn(
                      "hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    )}
                    onClick={() => removeItem(index)}
                    aria-label="Убрать"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
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
