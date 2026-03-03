// deploy ping
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SECTIONS, STEPS, type DeckSection, type DeckStep } from "@/data/deck";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useActiveSlide(steps: DeckStep[]) {
  const [activeId, setActiveId] = useState(steps[0]?.id ?? "s01");

  useEffect(() => {
    const els = steps.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const id = (visible[0]?.target as HTMLElement | undefined)?.id;
        if (id) setActiveId(id);
      },
      { threshold: [0.35, 0.55, 0.75] }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps]);

  const activeIndex = useMemo(() => steps.findIndex((s) => s.id === activeId), [activeId]);
  const activeSlide = activeIndex >= 0 ? steps[activeIndex] : steps[0];

  const activeSection = useMemo(
    () => SECTIONS.find((s) => s.id === activeSlide.sectionId) ?? SECTIONS[0],
    [activeSlide.sectionId]
  );

  return { activeId, activeIndex, activeSlide, activeSection };
}

function useKeyboardNav(activeIndex: number, steps: DeckStep[]) {
  const last = steps.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      const key = e.key;
      if (key === "ArrowDown" || key === "PageDown" || key === " ") {
        e.preventDefault();
        const next = clamp(activeIndex + 1, 0, last);
        scrollToId(steps[next].id);
      }
      if (key === "ArrowUp" || key === "PageUp") {
        e.preventDefault();
        const prev = clamp(activeIndex - 1, 0, last);
        scrollToId(steps[prev].id);
      }
      if (key === "Home") {
        e.preventDefault();
        scrollToId(steps[0].id);
      }
      if (key === "End") {
        e.preventDefault();
        scrollToId(steps[last].id);
      }
    };

    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, last, steps]);
}

function DeckFullscreenButton() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Fullscreen API is not reliably supported on iOS Safari for the whole page.
    setEnabled(!!document.fullscreenEnabled);
    const onChange = () => setActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (!enabled) return null;

  return (
    <button
      onClick={async () => {
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          else await document.documentElement.requestFullscreen();
        } catch {}
      }}
      className="pointer-events-auto inline-flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/10 bg-ink/55 text-[12px] md:text-[14px] text-fog backdrop-blur hover:border-white/20"
      aria-label={active ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
      title={active ? "Exit fullscreen" : "Fullscreen"}
      type="button"
    >
      ⛶
    </button>
  );
}

function NavPills({ activeSection }: { activeSection: DeckSection }) {
  // Требование:
  // - Desktop: +30% размер
  // - Mobile: +15% размер
  // - "Дворец"/"Маяк" отдельные кнопки
  // - Разделы в одном общем контуре, без индивидуальных контуров
  // - Линия текста у всех кнопок на одном уровне

  const hBase = "h-8 md:h-10";
  const btnBase =
    `pointer-events-auto shrink-0 inline-flex ${hBase} items-center justify-center rounded-full border border-white/10 backdrop-blur whitespace-nowrap`;
  const projectBtn = `${btnBase} bg-ink/60 hover:border-white/20 px-4 md:px-6`;
  const sectionWrap = `${btnBase} bg-ink/35 hover:border-white/15 px-2 md:px-3 overflow-x-auto no-scrollbar`;
  const sectionItem = `inline-flex ${hBase} items-center justify-center px-3 md:px-4 rounded-full`;
  const textBase = "font-display uppercase tracking-wide2 leading-none text-[12px] md:text-[14px] lg:text-[16px]";

  return (
    <div className="pointer-events-auto flex items-center gap-2">
      {/* Проекты — две отдельные кнопки */}
      <Link href="/dvorets" className={`${projectBtn} ${textBase}`} aria-label="Открыть: Дворец">
        ДВОРЕЦ
      </Link>

      <button
        onClick={() => scrollToId("s01")}
        className={`${projectBtn} ${textBase}`}
        aria-label="К началу: Маяк"
        type="button"
      >
        МАЯК
      </button>

      {/* Разделы — общий контур */}
      <div className={sectionWrap} aria-label="Разделы презентации">
        {SECTIONS.map((s) => {
          const isActive = activeSection.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollToId(`s${String(s.from).padStart(2, "0")}`)}
              className={`${sectionItem} ${textBase} ${isActive ? "bg-white/12" : "hover:bg-white/5"}`}
              aria-label={`Перейти: ${s.title}`}
              type="button"
            >
              {s.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionDots({ activeSectionId }: { activeSectionId: string }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden lg:block">
      <div className="pointer-events-auto flex flex-col gap-3">
        {SECTIONS.map((s) => {
          const isActive = s.id === activeSectionId;
          return (
            <button
              key={s.id}
              onClick={() => scrollToId(`s${String(s.from).padStart(2, "0")}`)}
              className="group flex items-center gap-3"
              aria-label={`Перейти: ${s.title}`}
              type="button"
            >
              <span
                className={`h-2 w-2 rounded-full transition ${
                  isActive ? "bg-white/80" : "bg-white/25 group-hover:bg-white/45"
                }`}
              />
              <span className="text-[11px] text-fog/70 group-hover:text-fog/90">{s.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StorylinesHotspots() {
  const [pick, setPick] = useState<"guide" | "thin" | "antagonist" | null>(null);

  const copy = useMemo(
    () =>
      ({
        guide: {
          t: "ПРОВОДНИК",
          d: "Он знает все короткие пути, но шторм идёт не по маршрутам.",
        },
        thin: {
          t: "УНДИНА",
          d: "Суша пугает — и одновременно обещает новый путь.",
        },
        antagonist: {
          t: "ХАЛИФ",
          d: "Не имея права на ошибку он не может идти ни в одну сторону.",
        },
      }) as const,
    []
  );

  return (
    <>
      {/* 3 вертикальные зоны */}
      <button
        onClick={() => setPick("guide")}
        className="absolute left-[0%] top-[10%] h-[78%] w-[33%] cursor-pointer rounded-xl border border-transparent hover:border-ember/40 hover:bg-ember/5"
        aria-label="Проводник"
        type="button"
      />
      <button
        onClick={() => setPick("thin")}
        className="absolute left-[33%] top-[10%] h-[78%] w-[34%] cursor-pointer rounded-xl border border-transparent hover:border-ember/40 hover:bg-ember/5"
        aria-label="Тонкая линия"
        type="button"
      />
      <button
        onClick={() => setPick("antagonist")}
        className="absolute left-[67%] top-[10%] h-[78%] w-[33%] cursor-pointer rounded-xl border border-transparent hover:border-ember/40 hover:bg-ember/5"
        aria-label="Антагонист"
        type="button"
      />

      <AnimatePresence>
        {pick && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-6 right-6 md:left-10 md:right-10 max-w-[640px] rounded-2xl border border-white/15 bg-ink/70 p-4 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-[16px] uppercase tracking-wide2">{copy[pick].t}</div>
                <div className="mt-2 text-[13px] text-fog/85">{copy[pick].d}</div>
              </div>
              <button
                onClick={() => setPick(null)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-fog hover:border-white/25"
                type="button"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!pick && (
        <div className="pointer-events-none absolute bottom-6 left-6 text-[12px] text-fog/70">
          Нажми на персонажа ✦
        </div>
      )}
    </>
  );
}

function ContactsHotspots() {
  // Требование: "сдвинь максимально влево", с запасом (2–3мм), 3 независимые зоны, без hover-анимаций.
  // Координаты в процентах от 16:9 (slide-38.webp).
  return (
    <>
      {/* Plan B (верхняя зона) */}
      <a
        href="/plan-b"
        className="absolute left-[1.5%] top-[6.5%] h-[11%] w-[30%] cursor-pointer"
        aria-label="Изучить план B"
      />
      {/* TG (середина) */}
      <a
        href="https://t.me/bekagaev"
        target="_blank"
        rel="noreferrer"
        className="absolute left-[1.5%] top-[39.5%] h-[29%] w-[30%] cursor-pointer"
        aria-label="Telegram"
      />
      {/* Stroka (логотип снизу) */}
      <a
        href="https://stroka.art/"
        target="_blank"
        rel="noreferrer"
        className="absolute left-[1.5%] h-[23%] w-[30%] cursor-pointer"
        style={{ top: "calc(74% - 10px)" }}
        aria-label="Stroka.art"
      />
    </>
  );
}

function VideoFrame({
  step,
  isActive,
  nextId,
}: {
  step: DeckStep;
  isActive: boolean;
  nextId?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    if (!isActive) {
      v.pause();
      return;
    }

    // Пытаемся автозапуск СРАЗУ СО ЗВУКОМ.
    // Если браузер блокирует — покажем кнопку Play.
    const tryPlay = async () => {
      try {
        v.muted = false;
        await v.play();
        setBlocked(false);
      } catch {
        setBlocked(true);
      }
    };

    tryPlay();
  }, [isActive]);

  const enterVideoFullscreen = async () => {
    const v: any = ref.current;
    if (!v) return;
    try {
      if (v.requestFullscreen) await v.requestFullscreen();
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iOS native video fullscreen
    } catch {}
  };

  const onEnded = () => {
    if (!nextId) return;
    setTimeout(() => scrollToId(nextId), 60);
  };

  const playByUserGesture = async () => {
    const v = ref.current;
    if (!v) return;
    try {
      v.muted = false;
      await v.play();
      setBlocked(false);
    } catch {
      setBlocked(true);
    }
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={ref}
        src={step.src}
        poster={step.poster}
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        // @ts-ignore (Safari)
        disableRemotePlayback
        controlsList="nodownload noplaybackrate noremoteplayback"
        className="absolute inset-0 h-full w-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onEnded}
      />

      {/* Единственный UI: маленькая кнопка Fullscreen */}
      <button
        onClick={enterVideoFullscreen}
        className="pointer-events-auto absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur hover:border-white/25"
        aria-label="Fullscreen"
        title="Fullscreen"
        type="button"
      >
        ⛶
      </button>

      {/* Если автозапуск заблокирован — показываем Play */}
      {isActive && blocked && (
        <button
          onClick={playByUserGesture}
          className="absolute inset-0 flex items-center justify-center bg-black/20 text-white"
          aria-label="Play"
          type="button"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white/90 backdrop-blur">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 7.5v9l8-4.5-8-4.5z" fill="currentColor" />
            </svg>
          </span>
        </button>
      )}

      {/* Если пользователь поставил паузу — тоже можно вернуть Play (без лишнего текста) */}
      {isActive && !blocked && !isPlaying && (
        <button
          onClick={playByUserGesture}
          className="absolute inset-0 flex items-center justify-center bg-black/0 text-white"
          aria-label="Play"
          type="button"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white/90 backdrop-blur">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 7.5v9l8-4.5-8-4.5z" fill="currentColor" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

function RotateFrame() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
      <div className="font-display text-[22px] md:text-[26px] uppercase tracking-wide2">
        Поверните телефон
      </div>
      <div className="mt-3 text-[14px] md:text-[16px] text-fog/80">
        Презентация в горизонтальном формате
      </div>
    </div>
  );
}

function SlideFrame({
  step,
  isActive,
  isMobile,
  isPortrait,
  nextId,
}: {
  step: DeckStep;
  isActive: boolean;
  isMobile: boolean;
  isPortrait: boolean;
  nextId?: string;
}) {
  // На мобильных браузерах (iOS/Android) "настоящий" deck со snap/100vh часто ломается:
  // наезжают секции, появляются гигантские разрывы из‑за адресных баров.
  // Поэтому mobile = стабильный длинный скролл с фиксированным 16:9 кадром (как Plan B).
  const mobileFlow = isMobile;

  if (mobileFlow) {
    if (step.kind === "video") {
      return (
        <div className="relative w-full aspect-video bg-black">
          <VideoFrame step={step} isActive={isActive} nextId={nextId} />
        </div>
      );
    }

    if (step.kind === "rotate") {
      return (
        <div className="relative w-full aspect-video bg-ink">
          <div className="absolute inset-0">
            <RotateFrame />
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-video bg-ink">
        <img
          src={step.src}
          alt={`Slide ${step.num}`}
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />

        {/* интерактив */}
        {step.num === 16 && <StorylinesHotspots />}
        {step.num === 38 && <ContactsHotspots />}
      </div>
    );
  }

  // Desktop — deck/fullscreen
  if (step.kind === "video") {
    return (
      <div className="absolute inset-0">
        <VideoFrame step={step} isActive={isActive} nextId={nextId} />
      </div>
    );
  }

  if (step.kind === "rotate") {
    return (
      <div className="absolute inset-0">
        <RotateFrame />
      </div>
    );
  }

  const shouldContain = false; // на десктопе всегда cover

  return (
    <div className="absolute inset-0">
      <img
        src={step.src}
        alt={`Slide ${step.num}`}
        className={`absolute inset-0 h-full w-full ${shouldContain ? "object-contain" : "object-cover"}`}
        draggable={false}
      />

      {/* интерактив */}
      {step.num === 16 && <StorylinesHotspots />}
      {step.num === 38 && <ContactsHotspots />}
    </div>
  );
}

export default function Page() {
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const on = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    };
    on();
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);

  const isMobile = vw > 0 && vw <= 900;
  const isPortrait = vh > vw && vw > 0;

  // Mobile: показываем rotate-хинт (r01). Desktop: r01 убираем.
  const steps = useMemo(() => (isMobile ? STEPS : STEPS.filter((s) => s.kind !== "rotate")), [isMobile]);

  const { activeId, activeIndex, activeSection } = useActiveSlide(steps);
  useKeyboardNav(activeIndex, steps);

  const deckRef = useRef<HTMLDivElement | null>(null);

  // Wheel navigation (desktop): treat wheel like slide-by-slide navigation to avoid snap drift when scrolling up.
  useEffect(() => {
    if (isMobile) return;
    const el = deckRef.current;
    if (!el) return;

    let last = 0;
    const cooldown = 650;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 12) return;
      const now = Date.now();
      if (now - last < cooldown) {
        e.preventDefault();
        return;
      }
      last = now;
      e.preventDefault();

      const dir = e.deltaY > 0 ? 1 : -1;
      const target = clamp(activeIndex + dir, 0, steps.length - 1);
      scrollToId(steps[target].id);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as any);
  }, [isMobile, activeIndex, steps]);

  // Keep URL hash in sync
  useEffect(() => {
    if (!activeId) return;
    const url = new URL(window.location.href);
    url.hash = activeId;
    window.history.replaceState({}, "", url.toString());
  }, [activeId]);

  // If opened with #sXX — jump
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (id && steps.some((s) => s.id === id)) {
      setTimeout(() => scrollToId(id), 50);
    }
  }, [steps]);

  // Prefetch next slides (ускоряет ощущение “презентации”)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefetch = (id: string) => {
      const slide = steps.find((s) => s.id === id);
      if (!slide || slide.kind !== "image") return;
      const img = new window.Image();
      img.src = slide.src;
    };
    const ids = [steps[activeIndex + 1]?.id, steps[activeIndex + 2]?.id, steps[activeIndex + 3]?.id].filter(Boolean) as string[];
    ids.forEach(prefetch);
  }, [activeIndex, steps]);

  return (
    <>
      {/* Top bar */}
      <div className={`topbar pointer-events-none fixed left-3 right-3 top-3 z-50 ${isMobile ? "topbar--mobile" : ""}`}>
        <div className={`flex items-center justify-between gap-3 ${isMobile ? "topbar__inner--mobile" : ""}`}>
          <NavPills activeSection={activeSection} />

          <div className="pointer-events-auto flex items-center gap-2">
            <DeckFullscreenButton />
            <div className="rounded-full border border-white/10 bg-ink/55 px-3 py-2 text-[12px] md:text-[14px] text-fog backdrop-blur">
              {activeIndex + 1} / {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Section dots (desktop) */}
      <SectionDots activeSectionId={activeSection.id} />

      {/* Slides */}
      <div ref={deckRef} className="deck">
        {steps.map((s, i) => {
          const nextId = steps[i + 1]?.id;
          const isActive = i === activeIndex;

          return (
            <section key={s.id} id={s.id} className="slide">
              <SlideFrame step={s} isActive={isActive} isMobile={isMobile} isPortrait={isPortrait} nextId={nextId} />
            </section>
          );
        })}
      </div>
    </>
  );
}
