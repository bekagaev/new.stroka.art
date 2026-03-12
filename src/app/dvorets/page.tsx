"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DVO_SECTIONS, DVO_STEPS } from "@/data/dvorets";
import { type DeckSection, type DeckStep } from "@/data/deck";

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

  const activeIndex = useMemo(() => steps.findIndex((s) => s.id === activeId), [activeId, steps]);
  const activeSlide = activeIndex >= 0 ? steps[activeIndex] : steps[0];

  const activeSection = useMemo(
    () => DVO_SECTIONS.find((s) => s.id === (activeSlide as any).sectionId) ?? DVO_SECTIONS[0],
    [activeSlide]
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
  const hBase = "h-8 md:h-10";
  const btnBase = `pointer-events-auto shrink-0 inline-flex ${hBase} items-center justify-center rounded-full border border-white/10 backdrop-blur whitespace-nowrap`;
  const projectBtn = `${btnBase} bg-ink/60 hover:border-white/20 px-4 md:px-6`;
  const sectionWrap = `${btnBase} bg-ink/35 hover:border-white/15 px-2 md:px-3 overflow-x-auto no-scrollbar`;
  const sectionItem = `inline-flex ${hBase} items-center justify-center px-3 md:px-4 rounded-full`;
  const textBase = "font-display uppercase tracking-wide2 leading-none text-[12px] md:text-[14px] lg:text-[16px]";

  return (
    <div className="pointer-events-auto flex items-center gap-2">
      {/* Проекты — две отдельные кнопки */}
      <button
        onClick={() => scrollToId("s01")}
        className={`${projectBtn} ${textBase}`}
        aria-label="К началу: Дворец"
        type="button"
      >
        ДВОРЕЦ
      </button>

      <Link href="/#s01" className={`${projectBtn} ${textBase}`} aria-label="Открыть: Маяк">
        МАЯК
      </Link>

      {/* Разделы — общий контур */}
      <div className={sectionWrap} aria-label="Разделы презентации">
        {DVO_SECTIONS.map((s) => {
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
        {DVO_SECTIONS.map((s) => {
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
}: {
  step: DeckStep;
  isActive: boolean;
  isMobile: boolean;
}) {
  const mobileFlow = isMobile;

  if ((step as any).kind === "rotate") {
    if (mobileFlow) {
      return (
        <div className="relative w-full aspect-video bg-ink">
          <div className="absolute inset-0">
            <RotateFrame />
          </div>
        </div>
      );
    }
    return <div className="absolute inset-0"><RotateFrame /></div>;
  }

  if (mobileFlow) {
    return (
      <div className="relative w-full aspect-video bg-ink">
        <img
          src={(step as any).src}
          alt={`Slide ${(step as any).num ?? ""}`}
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
      </div>
    );
  }

  // Desktop — fullscreen deck
  return (
    <div className="absolute inset-0">
      <img
        src={(step as any).src}
        alt={`Slide ${(step as any).num ?? ""}`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}

export default function DvoretsPage() {
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

  // Mobile: показываем rotate-хинт (r01). Desktop: r01 убираем.
  const steps = useMemo(
    () => (isMobile ? DVO_STEPS : DVO_STEPS.filter((s) => (s as any).kind !== "rotate")),
    [isMobile]
  );

  const { activeId, activeIndex, activeSection } = useActiveSlide(steps);
  useKeyboardNav(activeIndex, steps);

  const deckRef = useRef<HTMLDivElement | null>(null);

  // Desktop wheel navigation как deck
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
          const isActive = i === activeIndex;
          return (
            <section key={s.id} id={s.id} className="slide">
              <SlideFrame step={s} isActive={isActive} isMobile={isMobile} />
            </section>
          );
        })}
      </div>
    </>
  );
}
