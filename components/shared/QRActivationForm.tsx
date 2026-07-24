"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/useAppStore";

const schema = z.object({
  code: z.string().min(1, "Введите код"),
});

type FormData = z.infer<typeof schema>;

export function QRActivationForm() {
  const activateCode = useAppStore((s) => s.activateCode);
  const [result, setResult] = useState<{ success: boolean; bonus?: string; error?: string } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    const res = activateCode(data.code);
    setResult(res);
    if (res.success) reset();
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="code">Код активации</Label>
          <Input
            id="code"
            placeholder="GADALKA-CARD-2026"
            className="mt-2 font-mono uppercase"
            {...register("code")}
            aria-invalid={!!errors.code}
          />
          {errors.code && <p className="text-xs text-destructive mt-1">{errors.code.message}</p>}
        </div>
        <Button type="submit" className="w-full">
          <QrCode className="h-4 w-4 mr-2" />
          Активировать
        </Button>
      </form>

      <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground mb-2">Тестовые коды:</p>
        <ul className="text-xs font-mono space-y-1 text-gold/70">
          <li>GADALKA-CARD-2026</li>
          <li>GADALKA-DREAM-2026</li>
          <li>GADALKA-GIFT-2026</li>
        </ul>
      </div>

      {result && (
        <div className={`mt-4 p-4 rounded-lg border flex items-start gap-3 ${result.success ? "border-green-500/30 bg-green-500/10" : "border-destructive/30 bg-destructive/10"}`}>
          {result.success ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
              <div>
                <p className="text-sm font-medium">Активация успешна!</p>
                <p className="text-sm text-muted-foreground mt-1">{result.bonus}</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium">Ошибка активации</p>
                <p className="text-sm text-muted-foreground mt-1">{result.error}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
