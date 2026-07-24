import Link from "next/link";
import { Scale, Shield, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LEGAL_DISCLAIMER } from "@/lib/utils";

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-3xl">
      <PageHeader
        title="Правовая информация"
        description="Условия использования и важные ограничения платформы «Архив Гадалки»"
      />

      {/* Main disclaimer */}
      <section className="rounded-2xl border border-gold/20 bg-gradient-to-br from-burgundy/10 to-purple-deep/10 p-6 md:p-8 mb-10">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-gold shrink-0 mt-1" />
          <div>
            <h2 className="font-serif text-xl mb-3">Общий дисклеймер</h2>
            <p className="text-muted-foreground leading-relaxed">{LEGAL_DISCLAIMER}</p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="space-y-8">
        <section className="rounded-xl border border-border bg-card/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-5 w-5 text-gold" />
            <h3 className="font-serif text-lg">Характер материалов</h3>
          </div>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Все материалы платформы «Архив Гадалки» — включая карты Таро, толкования символов,
              анализ снов, AI-ассистента и игровой контент — созданы исключительно в развлекательных
              и информационных целях.
            </p>
            <p>
              Интерпретации карт, символов и снов являются художественным и культурным контентом,
              основанным на традициях символизма, а не на научных или медицинских данных.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-gold" />
            <h3 className="font-serif text-lg">Ограничение ответственности</h3>
          </div>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Материалы платформы не являются и не заменяют медицинскую, психологическую,
              юридическую или финансовую консультацию. Не принимайте важные жизненные решения
              исключительно на основе контента платформы.
            </p>
            <p>
              AI-толкователь генерирует ответы на основе алгоритмов и не обладает способностью
              предсказывать будущее или давать профессиональные рекомендации.
            </p>
            <p>
              Администрация платформы не несёт ответственности за решения, принятые пользователями
              на основе материалов сервиса.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card/30 p-6">
          <h3 className="font-serif text-lg mb-4">Персональные данные</h3>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Данные профиля, записи снов, заметки и история раскладов хранятся локально
              в браузере пользователя. Политика обработки персональных данных будет опубликована
              при подключении серверной инфраструктуры на следующем этапе разработки.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card/30 p-6">
          <h3 className="font-serif text-lg mb-4">Интеллектуальная собственность</h3>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Все материалы платформы «Архив Гадалки», включая тексты, иллюстрации, дизайн
              и программный код, защищены авторским правом. Сериал «Гадалка» и связанные
              с ним образы являются интеллектуальной собственностью правообладателей.
            </p>
            <p>
              Запрещается копирование, распространение и коммерческое использование материалов
              без письменного согласия правообладателей.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card/30 p-6">
          <h3 className="font-serif text-lg mb-4">Возрастные ограничения</h3>
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p>
              Платформа предназначена для пользователей старше 18 лет. Контент может содержать
              темы, связанные с символизмом, мистикой и психологическими аспектами,
              которые не рекомендуются для несовершеннолетних.
            </p>
          </div>
        </section>
      </div>

      <p className="text-xs text-muted-foreground mt-10 text-center">
        © 2026 Архив Гадалки. По вопросам:{" "}
        <Link href="/about" className="text-gold hover:underline">
          О проекте
        </Link>
      </p>
    </div>
  );
}
