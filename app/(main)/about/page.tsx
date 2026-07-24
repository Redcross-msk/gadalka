import Link from "next/link";
import { Sparkles, Tv, Gamepad2, ShoppingBag, Layers } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EcosystemCards } from "@/components/shared/EcosystemCard";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
      <PageHeader
        title="О проекте"
        description="Цифровая экосистема «Архив Гадалки» — интерактивное продолжение истории сериала"
      />

      {/* Hero */}
      <section className="rounded-2xl border border-gold/20 bg-gradient-to-br from-burgundy/20 to-purple-deep/20 p-8 md:p-12 mb-16">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-background/30 border border-gold/30 shrink-0">
            <Sparkles className="h-10 w-10 text-gold" />
          </div>
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold">Архив Гадалки</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">
              Это персональная цифровая платформа, интерактивная игра и магазин коллекционных товаров,
              созданные по мотивам телесериала «Гадалка». Экосистема объединяет карты Таро, энциклопедию
              символов, дневник снов, AI-толкователя и физические товары с QR-активацией.
            </p>
          </div>
        </div>
      </section>

      {/* About series */}
      <section className="mb-16">
        <SectionHeader title="О сериале «Гадалка»" />
        <div className="rounded-xl border border-border bg-card/30 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Tv className="h-6 w-6 text-gold" />
            <h3 className="font-serif text-xl">История, которая вдохновила экосистему</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Сериал «Гадалка» рассказывает историю женщины, обнаружившей в себе древний дар видеть знаки
            и символы. На протяжении сезонов героиня исследует границу между реальностью и тайным,
            между прошлым и настоящим. Каждый эпизод наполнен символами, намёками и загадками,
            которые находят отражение в цифровом Архиве.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            Платформа позволяет зрителям не просто наблюдать историю, а стать её частью —
            вести собственный дневник знаков, интерпретировать сны и проходить тематические программы,
            связанные с сюжетом сериала.
          </p>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="mb-16">
        <SectionHeader title="Три столпа экосистемы" />
        <EcosystemCards />
      </section>

      {/* Features */}
      <section className="mb-16">
        <SectionHeader title="Возможности платформы" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Layers,
              title: "Карты и расклады",
              desc: "Полная колода из 78 карт с подробными значениями, расклады на любые темы и история ваших сессий.",
            },
            {
              icon: Sparkles,
              title: "Сны и символы",
              desc: "Дневник снов с анализом, энциклопедия символов и отслеживание повторяющихся знаков.",
            },
            {
              icon: Gamepad2,
              title: "Интерактивная игра",
              desc: "Погружение в истории сериала через испытания, коллекции и сюжетные главы.",
            },
            {
              icon: ShoppingBag,
              title: "Коллекционные товары",
              desc: "Физические колоды, свечи и аксессуары с QR-кодами для цифровых бонусов.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-xl border border-border bg-card/30 p-6">
                <Icon className="h-6 w-6 text-gold mb-3" />
                <h4 className="font-serif text-lg">{item.title}</h4>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-gold/30 bg-gradient-to-r from-burgundy/10 to-purple-deep/10 p-8 md:p-12 text-center">
        <h3 className="font-serif text-2xl">Начните своё путешествие</h3>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Создайте профиль, пройдите onboarding и откройте свой персональный архив знаков и символов.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button asChild>
            <Link href="/register">Создать профиль</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/platform">Перейти на платформу</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
