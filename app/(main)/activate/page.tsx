import { PageHeader } from "@/components/layout/PageHeader";
import { QRActivationForm } from "@/components/shared/QRActivationForm";
import { QrCode } from "lucide-react";

export default function ActivatePage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-2xl">
      <PageHeader
        title="Активация кода"
        description="Введите код с QR-наклейки на товаре или из цифрового письма для получения бонусов"
      />

      <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-burgundy/10 to-purple-deep/10 p-6 md:p-10">
        <div className="flex justify-center mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-background/30 border border-gold/30">
            <QrCode className="h-10 w-10 text-gold" />
          </div>
        </div>

        <QRActivationForm />

        <div className="mt-8 pt-8 border-t border-border">
          <h3 className="font-serif text-lg mb-3">Где найти код?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• QR-наклейка внутри упаковки физического товара</li>
            <li>• Письмо с кодом после покупки цифрового товара</li>
            <li>• Подарочная открытка в подарочных наборах</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
