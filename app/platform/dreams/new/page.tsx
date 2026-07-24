"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mic } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { dreamMoods, generateDreamAnalysis } from "@/data/dreams";
import { useAppStore } from "@/store/useAppStore";
import { createDreamAction } from "@/features/platform/actions";
import type { DreamMood } from "@/types";
import type { DreamMood as DbDreamMood } from "@prisma/client";

const moodToDb: Record<DreamMood, DbDreamMood> = {
  peaceful: "PEACEFUL",
  anxious: "ANXIOUS",
  mysterious: "MYSTERIOUS",
  joyful: "JOYFUL",
  sad: "SAD",
  neutral: "NEUTRAL",
};

const dreamSchema = z.object({
  title: z.string().min(1, "Укажите название сна"),
  description: z.string().min(10, "Опишите сон подробнее (минимум 10 символов)"),
  date: z.string().min(1, "Укажите дату"),
  mood: z.enum(["peaceful", "anxious", "mysterious", "joyful", "sad", "neutral"]),
  characters: z.string().optional(),
  places: z.string().optional(),
  symbols: z.string().optional(),
  recurring: z.boolean(),
  personalNote: z.string().optional(),
});

type DreamFormData = z.infer<typeof dreamSchema>;

export default function NewDreamPage() {
  const router = useRouter();
  const addDream = useAppStore((s) => s.addDream);
  const addToast = useAppStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DreamFormData>({
    resolver: zodResolver(dreamSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      mood: "neutral",
      characters: "",
      places: "",
      symbols: "",
      recurring: false,
      personalNote: "",
    },
  });

  const recurring = watch("recurring");

  const onSubmit = async (data: DreamFormData) => {
    const symbols = data.symbols
      ? data.symbols.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const characters = data.characters
      ? data.characters.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const places = data.places
      ? data.places.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const dreamData = {
      title: data.title,
      description: data.description,
      date: data.date,
      mood: data.mood as DreamMood,
      characters,
      places,
      symbols,
      recurring: data.recurring,
      personalNote: data.personalNote || "",
      analysis: generateDreamAnalysis({ title: data.title, symbols }),
    };

    let dbId: string | null = null;
    try {
      const saved = await createDreamAction({
        title: data.title,
        description: data.description,
        dreamDate: data.date,
        mood: moodToDb[data.mood as DreamMood],
        characters,
        places,
        symbols,
        recurring: data.recurring,
        personalNote: data.personalNote || "",
      });
      dbId = saved.id;
      dreamData.analysis = {
        summary: saved.analysis?.summary ?? dreamData.analysis?.summary ?? "",
        emotions: saved.analysis?.emotions ?? [],
        foundSymbols: saved.analysis?.foundSymbols ?? [],
        themes: saved.analysis?.themes ?? [],
        questions: saved.analysis?.questions ?? [],
      };
    } catch {
      // останется локальный сейв
    }

    addDream(dbId ? { ...dreamData, id: dbId } : dreamData);
    addToast({
      title: "Сон сохранён",
      description: dbId ? "Записан в базу и разобран анализом" : "Сохранено локально",
      variant: "success",
    });

    const dreams = useAppStore.getState().dreams;
    const newDream = dreams[0];
    router.push(`/platform/dreams/${dbId ?? newDream.id}`);
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Дневник снов", href: "/platform/dreams" },
          { label: "Новый сон" },
        ]}
      />
      <PageHeader
        title="Записать сон"
        description="Опишите сон, пока воспоминания свежи"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div>
          <Label htmlFor="title">Название</Label>
          <Input id="title" {...register("title")} className="mt-2" placeholder="Дверь в тумане" />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Описание сна</Label>
            <Button type="button" variant="ghost" size="sm" disabled title="Скоро">
              <Mic className="h-4 w-4" />
              Голосовой ввод — Скоро
            </Button>
          </div>
          <Textarea
            id="description"
            {...register("description")}
            className="mt-2 min-h-[160px]"
            placeholder="Опишите сон подробно: что происходило, кто был рядом, какие образы запомнились..."
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Дата</Label>
            <Input id="date" type="date" {...register("date")} className="mt-2" />
            {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <Label htmlFor="mood">Настроение</Label>
            <select
              id="mood"
              {...register("mood")}
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
            >
              {dreamMoods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="characters">Персонажи (через запятую)</Label>
          <Input id="characters" {...register("characters")} className="mt-2" placeholder="Я, Незнакомая женщина" />
        </div>

        <div>
          <Label htmlFor="places">Места (через запятую)</Label>
          <Input id="places" {...register("places")} className="mt-2" placeholder="Коридор, Комната с зеркалом" />
        </div>

        <div>
          <Label htmlFor="symbols">Символы (slug через запятую)</Label>
          <Input id="symbols" {...register("symbols")} className="mt-2" placeholder="dver, zerkalo, voda" />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card/30 p-4">
          <div>
            <Label htmlFor="recurring">Повторяющийся сон</Label>
            <p className="text-xs text-muted-foreground mt-1">Этот образ уже появлялся раньше</p>
          </div>
          <Switch
            id="recurring"
            checked={recurring}
            onCheckedChange={(v) => setValue("recurring", v)}
          />
        </div>

        <div>
          <Label htmlFor="personalNote">Личная заметка</Label>
          <Textarea
            id="personalNote"
            {...register("personalNote")}
            className="mt-2"
            placeholder="Что вы чувствовали после пробуждения?"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Сохранить и проанализировать"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/platform/dreams">Отмена</Link>
          </Button>
        </div>
      </form>

    </>
  );
}
