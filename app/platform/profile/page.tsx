"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { User, Crown, LogOut, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { NatalChartSection } from "@/components/platform/NatalChartSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useHydration";
import { updateProfileAction } from "@/features/platform/actions";
import { interestOptions } from "@/data/user";
import { zodiacSigns, getZodiacName } from "@/data/horoscopes";
import { getZodiacFromDate, getConstellation } from "@/data/natal";
import { appToDbZodiac } from "@/lib/mappers/user";
import Link from "next/link";
import type { NatalChart, User as UserType, ZodiacSign } from "@/types";
import { cn } from "@/lib/utils";

type ProfileDraft = {
  name: string;
  email: string;
  interests: string[];
  zodiacSign?: ZodiacSign;
  natalChart?: NatalChart;
};

function buildDraft(user: UserType): ProfileDraft {
  return {
    name: user.name,
    email: user.email,
    interests: [...user.interests],
    zodiacSign: user.zodiacSign,
    natalChart: user.natalChart ? { ...user.natalChart } : undefined,
  };
}

export default function ProfilePage() {
  const { user, isPremium, hydrated, isAuthenticated } = useAuth();
  const updateUser = useAppStore((s) => s.updateUser);
  const logout = useAppStore((s) => s.logout);
  const addToast = useAppStore((s) => s.addToast);
  const [pending, startTransition] = useTransition();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);

  const startEditing = () => {
    if (!user) return;
    setDraft(buildDraft(user));
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(null);
    setEditing(false);
  };

  const saveProfile = () => {
    if (!draft) return;

    const derivedZodiac =
      draft.natalChart?.birthDate
        ? getZodiacFromDate(draft.natalChart.birthDate) ?? draft.zodiacSign
        : draft.zodiacSign;

    const name = draft.name.trim() || user!.name;
    const natal = draft.natalChart?.birthDate ? draft.natalChart : undefined;

    startTransition(async () => {
      try {
        await updateProfileAction({
          displayName: name,
          interests: draft.interests,
          zodiacSign: derivedZodiac ? appToDbZodiac[derivedZodiac] : null,
          birthDate: natal?.birthDate ?? null,
          birthTime: natal?.birthTime ?? null,
          birthPlace: natal?.birthPlace ?? null,
          onboardingComplete: true,
        });
      } catch {
        addToast({ title: "Не удалось сохранить в базу", variant: "error" });
        return;
      }

      updateUser({
        name,
        email: draft.email.trim() || user!.email,
        interests: draft.interests,
        zodiacSign: derivedZodiac,
        natalChart: natal,
        onboardingComplete: true,
      });

      addToast({ title: "Профиль обновлён", variant: "success" });
      setEditing(false);
      setDraft(null);
    });
  };

  const handleLogout = () => {
    logout();
    void signOut({ callbackUrl: "/" });
  };

  const toggleInterest = (id: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      interests: draft.interests.includes(id)
        ? draft.interests.filter((i) => i !== id)
        : [...draft.interests, id],
    });
  };

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-secondary rounded-lg w-1/3" />
        <div className="h-64 bg-secondary rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div>
        <PageHeader title="Профиль" description="Настройки аккаунта" />
        <div className="rounded-xl border border-border bg-card/30 p-8 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl">Войдите в аккаунт</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Чтобы управлять профилем, необходимо авторизоваться
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/?auth=required&from=/platform/profile">Войти</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/?auth=required&from=/platform/profile">Создать профиль</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const display = editing && draft ? draft : user;
  const selectedZodiac = zodiacSigns.find((z) => z.id === display.zodiacSign);
  const userInterests = interestOptions.filter((o) => display.interests.includes(o.id));

  return (
    <div>
      <PageHeader title="Профиль" description={editing ? "Редактирование профиля" : "Ваш профиль"}>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing} disabled={pending}>
                Отмена
              </Button>
              <Button size="sm" onClick={saveProfile} disabled={pending}>
                {pending ? "Сохранение…" : "Сохранить"}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="h-4 w-4 mr-1" />
              Изменить профиль
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Выйти
          </Button>
        </div>
      </PageHeader>

      <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-burgundy/20 to-purple-deep/20 p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-background/30 border border-gold/30 shrink-0">
            <User className="h-10 w-10 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {editing && draft ? (
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="font-serif text-xl max-w-xs bg-background/40"
                />
              ) : (
                <h2 className="font-serif text-2xl">{user.name}</h2>
              )}
              {isPremium && (
                <Badge variant="premium">
                  <Crown className="h-3 w-3 mr-1" />
                  Гадалка+
                </Badge>
              )}
            </div>
            {editing && draft ? (
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="mt-2 max-w-sm bg-background/40"
              />
            ) : (
              <p className="text-muted-foreground mt-1">{user.email}</p>
            )}
            <p className="text-sm text-gold mt-2">
              Уровень {user.level}
              {display.zodiacSign ? ` · ${getZodiacName(display.zodiacSign)}` : ""}
            </p>
          </div>
          {!isPremium && !editing && (
            <Button variant="premium" asChild>
              <Link href="/platform/subscription">Улучшить подписку</Link>
            </Button>
          )}
        </div>
      </div>

      <NatalChartSection
        natalChart={user.natalChart}
        zodiacSign={editing ? draft?.zodiacSign : user.zodiacSign}
        editing={editing}
        draft={draft?.natalChart}
        onDraftChange={(natalChart) =>
          draft && setDraft({ ...draft, natalChart })
        }
      />

      <div className="rounded-xl border border-border bg-card/30 p-6 md:p-8 mb-8">
        <h3 className="font-serif text-xl mb-2">Знак зодиака</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {editing
            ? "Выберите знак или укажите дату в натальной карте"
            : "Для персонального гороскопа на сегодня"}
        </p>

        {editing && draft ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {zodiacSigns.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setDraft({ ...draft, zodiacSign: z.id })}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all min-h-[64px]",
                  draft.zodiacSign === z.id
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border hover:border-gold/30"
                )}
              >
                <p className="font-serif text-sm">{z.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{z.dates}</p>
              </button>
            ))}
          </div>
        ) : selectedZodiac ? (
          <div className="inline-flex items-center gap-3 rounded-xl border border-gold/25 bg-gold/5 px-5 py-4">
            <span className="font-serif text-3xl text-gold">
              {getConstellation(selectedZodiac.id).symbol}
            </span>
            <div>
              <p className="font-serif text-lg text-gold-light">{selectedZodiac.name}</p>
              <p className="text-xs text-muted-foreground">{selectedZodiac.dates}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Не указан</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card/30 p-6 md:p-8">
        <h3 className="font-serif text-xl mb-4">Интересы</h3>

        {editing && draft ? (
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((opt) => {
              const active = draft.interests.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleInterest(opt.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm transition-all",
                    active
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-border text-muted-foreground hover:border-gold/30"
                  )}
                >
                  <span className="mr-1">{opt.emoji}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : userInterests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userInterests.map((opt) => (
              <span
                key={opt.id}
                className="rounded-full border border-gold/20 bg-burgundy/10 px-4 py-2 text-sm text-cream/90"
              >
                <span className="mr-1">{opt.emoji}</span>
                {opt.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Интересы не выбраны</p>
        )}
      </div>
    </div>
  );
}
