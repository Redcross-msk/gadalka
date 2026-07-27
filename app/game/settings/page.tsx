"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useIdleGameStore, useIdleHydrated } from "@/store/gameStore";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function GameSettingsPage() {
  const hydrated = useIdleHydrated();
  const { settings, updateSettings, resetProgress, applyDemoCode, isPremiumDemo } = useIdleGameStore();
  const isPremium = useAppStore((s) => s.isPremium);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  if (!hydrated) return <div className="p-12 text-center">Загрузка…</div>;

  return (
    <div className="min-h-screen card-back-surface">
      <div className="mx-auto max-w-lg px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/game"><ArrowLeft className="h-4 w-4 mr-1" /> К кабинету</Link>
        </Button>
        <h1 className="font-serif text-3xl">Настройки</h1>

        <div className="mt-8 space-y-5">
          <Row label="Гадалка+ в игре">
            {isPremium ? (
              <Badge variant="free">Доступно</Badge>
            ) : (
              <Switch
                checked={isPremiumDemo}
                onCheckedChange={(v) => useIdleGameStore.setState({ isPremiumDemo: v })}
                aria-label="Демо премиум"
              />
            )}
          </Row>
          {!isPremium && (
            <p className="text-[11px] text-muted-foreground -mt-3">
              Демо-переключатель для тестов. С подпиской функции открываются автоматически.
            </p>
          )}
          <Row label="Отключить звук">
            <Switch checked={settings.muted} onCheckedChange={(muted) => updateSettings({ muted })} />
          </Row>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label>Громкость</Label>
              <span className="text-muted-foreground">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.masterVolume}
              onChange={(e) => updateSettings({ masterVolume: Number(e.target.value) })}
              className="w-full accent-gold"
            />
          </div>
          <Row label="Звуки кликов">
            <Switch checked={settings.clickSounds} onCheckedChange={(clickSounds) => updateSettings({ clickSounds })} />
          </Row>
          <Row label="Анимации">
            <Switch checked={settings.animations} onCheckedChange={(animations) => updateSettings({ animations })} />
          </Row>
          <Row label="Уменьшить движение">
            <Switch checked={settings.reducedMotion} onCheckedChange={(reducedMotion) => updateSettings({ reducedMotion })} />
          </Row>
          <Row label="Компактный режим">
            <Switch checked={settings.compactMode} onCheckedChange={(compactMode) => updateSettings({ compactMode })} />
          </Row>
          <Row label="Подтверждать крупные покупки">
            <Switch checked={settings.confirmLargePurchases} onCheckedChange={(confirmLargePurchases) => updateSettings({ confirmLargePurchases })} />
          </Row>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="font-serif text-lg mb-2">Активация кода</p>
          <div className="flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="GADALKA-GAME-…" />
            <Button
              onClick={() => {
                const res = applyDemoCode(code);
                setMsg(res.message);
              }}
            >
              ОК
            </Button>
          </div>
          {msg && <p className="text-xs text-muted-foreground mt-2">{msg}</p>}
          <p className="text-[10px] text-muted-foreground mt-2">
            Тест: GADALKA-GAME-CARD-2026 · GADALKA-GAME-SYMBOL-2026 · GADALKA-GAME-ROOM-2026
          </p>
        </div>

        <div className="mt-8">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Сбросить весь прогресс Кабинета Гадалки?")) resetProgress();
            }}
          >
            Сбросить прогресс
          </Button>
        </div>

        <div className="mt-8 flex flex-col gap-2 text-sm">
          <Link href="/platform" className="text-gold/80 hover:text-gold">Вернуться на платформу</Link>
          <Link href="/shop" className="text-gold/80 hover:text-gold">Открыть магазин</Link>
          <Link href="/activate" className="text-gold/80 hover:text-gold">Активировать код</Link>
          <Link href="/platform/subscription" className="text-gold/80 hover:text-gold">Подписка Гадалка+</Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
