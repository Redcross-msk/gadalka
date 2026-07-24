import { prisma } from "@/lib/db";
import { resolveUploadedMediaSrc } from "@/lib/media-url";

export default async function AdminMediaPage() {
  const assets = await prisma.mediaAsset.findMany({
    take: 60,
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { include: { profile: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-gold-light">Медиатека</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Загруженные фото товаров, баннеры и аватары
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {assets.map((a) => {
          const src = resolveUploadedMediaSrc(a.url);
          return (
            <div
              key={a.id}
              className="rounded-xl border border-gold/15 bg-card/30 overflow-hidden"
            >
              <div className="relative aspect-square bg-black/20">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={a.alt ?? ""} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                    нет файла
                  </div>
                )}
              </div>
              <div className="p-2 space-y-0.5">
                <p className="text-[10px] uppercase tracking-wide text-gold/55 truncate">
                  {a.kind} · {a.ownerType}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {a.uploadedBy?.profile?.displayName ?? a.uploadedBy?.email ?? "система"}
                </p>
                <p className="text-[9px] text-mist/40 truncate">{a.url}</p>
              </div>
            </div>
          );
        })}
      </div>
      {assets.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Медиа пока нет</p>
      )}
    </div>
  );
}
