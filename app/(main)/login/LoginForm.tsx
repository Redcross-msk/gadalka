"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/useAppStore";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/platform";
  const login = useAppStore((s) => s.login);
  const addToast = useAppStore((s) => s.addToast);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: FormData) => {
    setError("");
    const success = login(data.email, data.password);
    if (success) {
      addToast({
        title: "Добро пожаловать!",
        description: "Один аккаунт — платформа, игра и магазин",
        variant: "success",
      });
      router.push(from.startsWith("/") ? from : "/platform");
    } else {
      setError("Не удалось войти. Проверьте данные.");
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-md">
      <div className="flex justify-center mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-burgundy/30 border border-gold/20">
          <Sparkles className="h-8 w-8 text-gold" />
        </div>
      </div>

      <PageHeader
        title="Вход"
        description="Один профиль для платформы, игры и магазина"
        className="text-center [&_h1]:text-center [&_p]:mx-auto"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card/30 p-6 md:p-8 space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="anna@example.com"
            className="mt-2"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="mt-2"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Войти
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href={`/register?from=${encodeURIComponent(from)}`} className="text-gold hover:underline">
            Регистрация
          </Link>
        </p>
      </form>
    </div>
  );
}
