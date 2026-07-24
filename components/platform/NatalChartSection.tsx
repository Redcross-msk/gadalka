"use client";

import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConstellationMap } from "@/components/platform/ConstellationMap";
import {
  formatBirthDate,
  formatBirthTime,
  getConstellation,
  getNatalMatrix,
  getZodiacFromDate,
} from "@/data/natal";
import { getZodiacName } from "@/data/horoscopes";
import type { NatalChart, ZodiacSign } from "@/types";

interface NatalChartSectionProps {
  natalChart?: NatalChart;
  zodiacSign?: ZodiacSign;
  editing: boolean;
  draft?: NatalChart;
  onDraftChange?: (natal: NatalChart) => void;
}

export function NatalChartSection({
  natalChart,
  zodiacSign,
  editing,
  draft,
  onDraftChange,
}: NatalChartSectionProps) {
  const data = editing ? draft : natalChart;
  const birthDate = data?.birthDate ?? "";
  const birthTime = data?.birthTime ?? "";
  const birthPlace = data?.birthPlace ?? "";
  const sign =
    zodiacSign ?? (birthDate ? getZodiacFromDate(birthDate) ?? undefined : undefined);

  if (editing) {
    return (
      <div className="rounded-xl border border-gold/20 bg-card/30 p-6 md:p-8 mb-8">
        <h3 className="font-serif text-xl mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          Натальная карта
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Дата и время рождения формируют вашу персональную карту и гороскоп
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="birthDate">Дата рождения</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) =>
                onDraftChange?.({
                  birthDate: e.target.value,
                  birthTime: birthTime || undefined,
                  birthPlace: birthPlace || undefined,
                })
              }
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="birthTime">Время рождения</Label>
            <Input
              id="birthTime"
              type="time"
              value={birthTime}
              onChange={(e) =>
                onDraftChange?.({
                  birthDate,
                  birthTime: e.target.value,
                  birthPlace: birthPlace || undefined,
                })
              }
              className="mt-2"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Можно оставить пустым</p>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="birthPlace">Место рождения</Label>
            <Input
              id="birthPlace"
              value={birthPlace}
              onChange={(e) =>
                onDraftChange?.({
                  birthDate,
                  birthTime: birthTime || undefined,
                  birthPlace: e.target.value,
                })
              }
              placeholder="Город"
              className="mt-2"
            />
          </div>
        </div>
        {sign && (
          <p className="mt-4 text-sm text-gold">Знак по дате: {getZodiacName(sign)}</p>
        )}
      </div>
    );
  }

  if (!natalChart?.birthDate || !sign) {
    return (
      <div className="rounded-2xl border border-gold/15 bg-white/[0.02] p-8 mb-8 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-gold/40 mb-3" />
        <p className="font-serif text-xl text-gold-light/80">Натальная карта</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Не заполнена. Нажмите «Изменить профиль», чтобы добавить дату и время рождения.
        </p>
      </div>
    );
  }

  const constellation = getConstellation(sign);
  const matrix = getNatalMatrix(natalChart, sign);

  return (
    <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-burgundy/15 to-[#2e282c]/40 p-6 md:p-8 mb-8 overflow-hidden relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/5 blur-3xl"
      />
      <div className="relative flex flex-col lg:flex-row gap-8">
        <div className="lg:w-[280px] shrink-0">
          <ConstellationMap constellation={constellation} size="lg" interactive />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold/65">Натальная карта</p>
            <h3 className="font-serif text-2xl md:text-3xl text-gold-light mt-1">
              {constellation.symbol} {getZodiacName(sign)}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Дата", value: formatBirthDate(natalChart.birthDate) },
              { label: "Время", value: formatBirthTime(natalChart.birthTime) },
              { label: "Стихия", value: matrix.element },
              { label: "Планета", value: matrix.rulingPlanet },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-gold/10 bg-white/[0.03] p-3">
                <p className="text-[10px] uppercase tracking-wider text-gold/55">{item.label}</p>
                <p className="text-sm text-cream mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          {natalChart.birthPlace && (
            <p className="text-sm text-cream-muted mb-4">
              Место рождения: <span className="text-cream">{natalChart.birthPlace}</span>
            </p>
          )}

          <div className="rounded-xl border border-gold/15 bg-white/[0.03] p-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-gold/65 mb-2">
              Матрица · путь {matrix.lifePath}
            </p>
            <p className="text-sm leading-relaxed text-cream/90">{matrix.summary}</p>
            <p className="text-xs text-mist/70 mt-3">{matrix.lifePathDescription}</p>
            <p className="text-xs text-mist/60 mt-2 italic">{matrix.ascendantHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
