"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/useAppStore";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAppStore((s) => s.register);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (data: FormData) => {
    registerUser(data.name, data.email, data.password);
    router.push("/register/onboarding");
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-md">
      <div className="flex justify-center mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-burgundy/30 border border-gold/20">
          <UserPlus className="h-8 w-8 text-gold" />
        </div>
      </div>

      <PageHeader
        title="Создать профиль"
        description="Присоединяйтесь к Архиву Гадалки и начните свой путь"
        className="text-center [&_h1]:text-center [&_p]:mx-auto"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-card/30 p-6 md:p-8 space-y-5">
        <div>
          <Label htmlFor="name">Имя</Label>
          <Input
            id="name"
            placeholder="Анна"
            className="mt-2"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

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

        <div>
          <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="mt-2"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Продолжить
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-gold hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </div>
  );
}
