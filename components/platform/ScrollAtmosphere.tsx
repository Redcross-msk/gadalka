"use client";

import { useEffect, useRef } from "react";

type BgCard = {
  x: number;
  y: number;
  rotate: number;
  appearAt: number;
  settled: boolean;
  w: number;
  h: number;
  opacityMax: number;
  fallFrom: number;
};

function scatterCards(): BgCard[] {
  const cards: BgCard[] = [];
  const placed: { x: number; y: number }[] = [];
  const minDist = 16;

  const tryPlace = (x: number, y: number) => {
    for (const p of placed) {
      const dx = p.x - x;
      const dy = (p.y - y) * 1.15;
      if (Math.hypot(dx, dy) < minDist) return false;
    }
    placed.push({ x, y });
    return true;
  };

  const rnd = (n: number) => {
    const s = Math.sin(n * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };

  const edgeSeeds = [
    [3, 12], [6, 38], [4, 64], [5, 88],
    [92, 10], [94, 36], [91, 62], [93, 86],
    [2, 24], [95, 48], [3, 76], [90, 22],
  ];

  let id = 1;
  for (const [x, y] of edgeSeeds) {
    if (!tryPlace(x, y)) continue;
    const r = rnd(id);
    const settled = id <= 5;
    cards.push({
      x,
      y,
      rotate: (r - 0.5) * 34,
      settled,
      appearAt: settled ? 0 : (id - 6) * 40,
      w: 148 + Math.floor(r * 22),
      h: 224 + Math.floor(r * 32),
      opacityMax: 0.72 + r * 0.12,
      fallFrom: 140 + r * 80,
    });
    id += 1;
  }

  for (let n = 0; n < 80 && cards.length < 20; n++) {
    const x = 4 + rnd(n + 40) * 92;
    const y = 6 + rnd(n + 90) * 88;
    if (!tryPlace(x, y)) continue;

    const r = rnd(n + 200);
    const isCenter = x > 28 && x < 72;
    const fallingIndex = cards.filter((c) => !c.settled).length;

    cards.push({
      x,
      y,
      rotate: (r - 0.5) * 40,
      settled: false,
      appearAt: fallingIndex * 45,
      w: isCenter ? 128 + r * 18 : 142 + r * 26,
      h: isCenter ? 194 + r * 26 : 216 + r * 36,
      opacityMax: isCenter ? 0.28 + r * 0.1 : 0.65 + r * 0.15,
      fallFrom: 160 + r * 100,
    });
  }

  return cards;
}

const BG_CARDS = scatterCards();

/** Целевой прогресс падения 0..1 для карты при данном scrollY */
function targetProgress(scrollY: number, card: BgCard, fallRange: number) {
  if (card.settled) return 1;
  const raw = (scrollY - card.appearAt) / fallRange;
  return Math.min(1, Math.max(0, raw));
}

export function ScrollAtmosphere() {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<number[]>(BG_CARDS.map((c) => (c.settled ? 1 : 0)));
  const scrollRef = useRef(0);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  useEffect(() => {
    const FALL_RANGE = 340;
    // появление — мягко; исчезновение — быстрее
    const SMOOTH_IN = 0.045;
    const SMOOTH_OUT = 0.16;
    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
    // opacity появляется мягче (медленнее в начале)
    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const paint = () => {
      const scrollY = scrollRef.current;
      let stillMoving = false;

      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        const cfg = BG_CARDS[i];
        if (!cfg) return;

        const target = targetProgress(scrollY, cfg, FALL_RANGE);
        let current = progressRef.current[i] ?? 0;
        const delta = target - current;

        if (Math.abs(delta) > 0.0006) {
          const k = delta > 0 ? SMOOTH_IN : SMOOTH_OUT;
          current += delta * k;
          stillMoving = true;
        } else {
          current = target;
        }
        progressRef.current[i] = current;

        const move = easeOutQuint(current);
        const fade = easeInOut(current);

        const y = (1 - move) * -cfg.fallFrom;
        const r = cfg.rotate + (1 - move) * 22;
        const s = 0.92 + move * 0.08;

        el.style.opacity = String(fade * cfg.opacityMax);
        el.style.transform = `translate3d(0,${y}px,0) rotate(${r}deg) scale(${s})`;
      });

      if (stillMoving) {
        rafRef.current = requestAnimationFrame(paint);
      } else {
        runningRef.current = false;
        rafRef.current = 0;
      }
    };

    const startLoop = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(paint);
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY || 0;
      startLoop();
    };

    scrollRef.current = window.scrollY || 0;
    startLoop();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      runningRef.current = false;
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none hidden lg:block"
      style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}
    >
      {BG_CARDS.map((card, i) => (
        <div
          key={i}
          ref={(el) => {
            cardsRef.current[i] = el;
          }}
          style={{
            position: "absolute",
            left: `${card.x}%`,
            top: `${card.y}%`,
            width: card.w,
            height: card.h,
            marginLeft: -card.w / 2,
            marginTop: -card.h / 2,
            borderRadius: 14,
            border: "1px solid rgba(216,188,120,0.38)",
            background:
              "linear-gradient(155deg, #5a4550 0%, #463840 48%, #342c34 100%)",
            boxShadow: "0 20px 44px rgba(0,0,0,0.28)",
            opacity: card.settled ? card.opacityMax : 0,
            transform: card.settled
              ? `rotate(${card.rotate}deg)`
              : `translate3d(0,-${card.fallFrom}px,0) rotate(${card.rotate + 28}deg) scale(0.9)`,
            willChange: "transform, opacity",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 11,
              borderRadius: 10,
              border: "1px solid rgba(216,188,120,0.22)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(242,223,168,0.5)",
              fontSize: 20,
            }}
          >
            ✦
          </div>
        </div>
      ))}
    </div>
  );
}
