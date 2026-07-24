import { hash } from "bcryptjs";
import { PrismaClient, ProductCategory, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Seed Гадалка…");

  const passwordHash = await hash("password123", 12);

  const demo = await prisma.user.upsert({
    where: { email: "demo@gadalka.local" },
    update: {},
    create: {
      email: "demo@gadalka.local",
      passwordHash,
      role: "USER",
      profile: {
        create: {
          displayName: "Демо-провидец",
          onboardingComplete: true,
          zodiacSign: "SCORPIO",
          interests: ["tarot", "dreams"],
        },
      },
      subscription: {
        create: { plan: "FREE", status: "ACTIVE" },
      },
      gameSave: {
        create: {
          level: 3,
          energy: 250,
          state: { level: 3, energy: 250 },
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@gadalka.local" },
    update: {},
    create: {
      email: "admin@gadalka.local",
      passwordHash,
      role: "ADMIN",
      profile: {
        create: {
          displayName: "Админ",
          onboardingComplete: true,
        },
      },
      subscription: {
        create: { plan: "PREMIUM", status: "ACTIVE" },
      },
      gameSave: {
        create: { level: 1, energy: 0, state: {} },
      },
    },
  });

  const products: {
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    category: ProductCategory;
    status: ProductStatus;
    digitalBonus?: string;
  }[] = [
    {
      slug: "deck-classic",
      name: "Колода «Архив Гадалки»",
      description: "Классическая колода по мотивам сериала — для раскладов и коллекции.",
      priceCents: 349000,
      category: "CARDS",
      status: "IN_STOCK",
      digitalBonus: "Цифровая колода в платформе",
    },
    {
      slug: "candle-night",
      name: "Свеча «Ночной кабинет»",
      description: "Ароматическая свеча с тёплым древесным ароматом.",
      priceCents: 129000,
      category: "CANDLES",
      status: "IN_STOCK",
    },
    {
      slug: "digital-plus-7",
      name: "Гадалка+ · 7 дней",
      description: "Пробный доступ к премиум-раскладам и анализу снов.",
      priceCents: 49000,
      category: "DIGITAL",
      status: "DIGITAL",
      digitalBonus: "7 дней Гадалка+",
    },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        category: p.category,
        status: p.status,
        digitalBonus: p.digitalBonus,
        sortOrder: i,
      },
      create: {
        ...p,
        sortOrder: i,
      },
    });
  }

  await prisma.activationCode.upsert({
    where: { code: "GADALKA-DEMO" },
    update: {},
    create: {
      code: "GADALKA-DEMO",
      bonusType: "PREMIUM_DAYS",
      bonusValue: "7",
      maxUses: 1000,
      active: true,
    },
  });

  await prisma.banner.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: { active: true },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Добро пожаловать в колоду",
      subtitle: "Платформа · Игра · Магазин",
      href: "/platform",
      placement: "home",
      active: true,
      sortOrder: 0,
    },
  });

  await prisma.mediaAsset.createMany({
    data: [
      {
        kind: "BANNER",
        ownerType: "SYSTEM",
        url: "/uploads/placeholders/banner-home.svg",
        alt: "Баннер главной (плейсхолдер под будущие фото)",
      },
      {
        kind: "PRODUCT",
        ownerType: "SYSTEM",
        url: "/uploads/placeholders/product.svg",
        alt: "Плейсхолдер товара",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✓ Users:", demo.email, admin.email, "(password: password123)");
  console.log("✓ Products:", products.length);
  console.log("✓ Activation: GADALKA-DEMO");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
