// deploy ping
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import { SECTIONS, STEPS, type DeckSection, type DeckStep } from "@/data/deck"

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function useActiveSlide(steps: DeckStep[]) {
  const [activeId, setActiveId] = useState(steps[0]?.id ?? 's01')

  useEffect(() => {
    const els = steps.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))
        const id = visible[0]?.target?.id
        if (id) setActiveId(id)
      },
      { threshold: [0.35, 0.55, 0.75] }
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [steps])

  const activeIndex = useMemo(() => steps.findIndex((s) => s.id === activeId), [activeId])
  const activeSlide = activeIndex >= 0 ? steps[activeIndex] : steps[0]
  const activeSection = useMemo(
    () => SECTIONS.find((s) => s.id === activeSlide.sectionId) ?? SECTIONS[0],
    [activeSlide.sectionId]
  )

  return { activeId, activeIndex, activeSlide, activeSection }
}

function useKeyboardNav(activeIndex: number, steps: DeckStep[]) {
  const last = steps.length - 1

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase()
      if (tag === "input" || tag === "textarea") return

      const key = e.key
      if (key === "ArrowDown" || key === "PageDown" || key === " ") {
        e.preventDefault()
        const next = clamp(activeIndex + 1, 0, last)
        scrollToId(steps[next].id)
      }
      if (key === "ArrowUp" || key === "PageUp") {
        e.preventDefault()
        const prev = clamp(activeIndex - 1, 0, last)
        scrollToId(steps[prev].id)
      }
      if (key === "Home") {
        e.preventDefault()
        scrollToId(steps[0].id)
      }
      if (key === "End") {
        e.preventDefault()
        scrollToId(steps[last].id)
      }
    }

    window.addEventListener("keydown", onKey, { passive: false })
    return () => window.removeEventListener("keydown", onKey)
  }, [activeIndex, last, steps])
}

function NavPills({ activeSection }: { activeSection: DeckSection }) {
  const pillBase =
    "shrink-0 flex h-7 items-center rounded-full border border-white/10 bg-ink/60 px-3 py-1 backdrop-blur hover:border-white/20 whitespace-nowrap"
  const pillText = "font-display text-[10px] uppercase tracking-wide2"

  return (
    <div className="pointer-events-auto flex flex-nowrap items-center gap-2 rounded-full border border-white/10 bg-ink/35 px-2 py-1 backdrop-blur overflow-x-auto no-scrollbar max-w-full">
      {/* Проекты */}
      <a href="/dvorets" className={`${pillBase} gap-2`} aria-label="Перейти: Дворец">
        <span className="h-5 w-5 rounded-full bg-[#7a0e12] shadow-[0_0_18px_rgba(122,14,18,0.35)]" />
        <span className={`${pillText} text-fog/85 hover:text-white`}>ДВОРЕЦ</span>
      </a>

      <button onClick={() => scrollToId("s01")} className={`${pillBase} gap-2`} aria-label="К началу: Маяк">
        <span className="h-5 w-5 rounded-full bg-ember/90 shadow-glow" />
        <span className={`${pillText} text-fog hover:text-white`}>МАЯК</span>
      </button>

      {/* Разделы */}
      {SECTIONS.map((s) => {
        const isActive = activeSection.id === s.id
        return (
          <button
            key={s.id}
            onClick={() => scrollToId(`s${String(s.from).padStart(2, "0")}`)}
            className={`${pillBase} ${isActive ? "bg-white/12" : ""}`}
            aria-label={`Перейти: ${s.title}`}
          >
            <span className={`${pillText} ${isActive ? "text-fog" : "text-ash hover:text-fog"}`}>{s.title}</span>
          </button>
        )
      })}
    </div>
  )
}

function SectionDots({ activeSectionId }: { activeSectionId: string }) {
  return (
    <div className="pointer-events-none fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 md:flex flex-col gap-3">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollToId(`s${String(s.from).padStart(2, "0")}`)}
          className="pointer-events-auto group flex items-center gap-3"
          aria-label={`Перейти: ${s.title}`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full border transition ${
              activeSectionId === s.id
                ? "border-ember bg-ember shadow-glow"
                : "border-white/25 bg-white/5 group-hover:border-white/40"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function StorylinesHotspots() {
  const [pick, setPick] = useState<"guide" | "thin" | "antagonist" | null>(null)

  const copy = useMemo(
    () =>
      ({
        guide: {
          t: "Проводник",
          d: "Скорость и ответственность. Он бежит так быстро, что ветер закладывает уши.",
        },
        thin: {
          t: "Тонкая линия",
          d: "Равновесие. Она «всё про воду» — и шторм выбрасывает её на сушу.",
        },
        antagonist: {
          t: "Антагонист",
          d: "Тьма и сопротивление. Он проверяет, где свет ломается — и что остаётся настоящим.",
        },
      }) as const,
    []
  )

  return (
    <>
      <div className="absolute inset-0">
        <button
          onClick={() => setPick("guide")}
          className="absolute left-[0%] top-[10%] h-[78%] w-[33%] cursor-pointer rounded-xl border border-transparent hover:border-ember/40 hover:bg-ember/5"
          aria-label="Проводник"
        />
        <button
          onClick={() => setPick("thin")}
          className="absolute left-[33%] top-[10%] h-[78%] w-[34%] cursor-pointer rounded-xl border border-transparent hover:border-ember/40 hover:bg-ember/5"
          aria-label="Тонкая линия"
        />
        <button
          onClick={() => setPick("antagonist")}
          className="absolute left-[67%] top-[10%] h-[78%] w-[33%] cursor-pointer rounded-xl border border-transparent hover:border-ember/40 hover:bg-ember/5"
          aria-label="Антагонист"
        />
      </div>

      <AnimatePresence>
        {pick && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-4 left-4 right-4 md:left-6 md:right-6 rounded-2xl border border-white/10 bg-ink/80 p-4 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-[10px] uppercase tracking-wide2 text-ember">{copy[pick].t}</div>
                <div className="mt-1 text-sm text-ash leading-relaxed">{copy[pick].d}</div>
              </div>
              <button
                onClick={() => setPick(null)}
                className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-fog hover:border-white/25"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!pick && (
        <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-ink/55 px-3 py-2 text-[11px] text-ash backdrop-blur">
          Нажми на персонажа ✦
        </div>
      )}
    </>
  )
}

function ContactsHotspots() {
  return (
    <div className="absolute inset-0">
      {/* Изучить план Б — по центру сверху */}
      <a
        href="/plan-b"
        className="absolute left-[22.5%] top-[8.5%] h-[7.5%] w-[55%] rounded-xl border border-transparent hover:border-white/25 hover:bg-white/5"
        aria-label="Изучить план Б"
      />

      {/* Telegram — центральный блок */}
      <a
        href="https://t.me/bekagaev"
        target="_blank"
        rel="noreferrer"
        className="absolute left-[22.5%] top-[49%] h-[21%] w-[55%] rounded-xl border border-transparent hover:border-white/25 hover:bg-white/5"
        aria-label="Telegram"
      />

      {/* Stroka — только логотип снизу */}
      <a
        href="https://stroka.art/"
        target="_blank"
        rel="noreferrer"
        className="absolute left-[8.5%] top-[71.5%] h-[25.2%] w-[68.7%] rounded-xl border border-transparent hover:border-white/25 hover:bg-white/5"
        aria-label="stroka.art"
      />
    </div>
  )
}


function VideoFrame({
  step,
  isActive,
  isMobile,
  isPortrait,
  nextId,
}: {
  step: DeckStep
  isActive: boolean
  isMobile: boolean
  isPortrait: boolean
  nextId?: string
}) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [blocked, setBlocked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return

    if (!isActive) {
      v.pause()
      return
    }

    // Попытка автозапуска. Если браузер блокирует звук без жеста — покажем кнопку.
    const tryPlay = async () => {
      try {
        await v.play()
        setBlocked(false)
      } catch {
        setBlocked(true)
      }
    }

    tryPlay()
  }, [isActive])

  return (
    <div className="relative flex h-full w-full items-center justify-center px-3 py-12 md:px-8">
      <div className={`relative ${isMobile && isPortrait && step.id === "s01" ? "w-[min(100vw,56.25vh)] h-[min(177.777vw,100vh)]" : "w-[min(100vw,177.777vh)] h-[min(56.25vw,100vh)]"}`}>
        <video
          ref={ref}
          src={step.src}
          poster={step.poster}
          className={`h-full w-full ${isMobile && isPortrait && step.id === "s01" ? "object-cover" : "object-contain"}`}
          playsInline
          preload="metadata"
          controls={false}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            if (!nextId) return
            setTimeout(() => scrollToId(nextId), 60)
          }}
        />

        {(!isPlaying || blocked) && (
          <button
            onClick={async () => {
              const v = ref.current
              if (!v) return
              try {
                await v.play()
                setBlocked(false)
              } catch {
                setBlocked(true)
              }
            }}
            className="absolute inset-0 flex items-center justify-center"
            aria-label="Воспроизвести"
          >
            <span className="rounded-full border border-white/25 bg-ink/55 px-4 py-3 text-xs text-fog backdrop-blur hover:border-white/35">
              ▶ Воспроизвести (со звуком)
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

function RotateFrame() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#05070b]">
      <div className="absolute inset-0 opacity-70" style={{ background: "radial-gradient(900px 500px at 70% 20%, rgba(255,190,120,0.08), transparent 55%), radial-gradient(800px 420px at 30% 80%, rgba(120,170,255,0.08), transparent 55%)" }} />
      <div className="relative flex flex-col items-center gap-6 px-8 text-center">
        <div className="h-20 w-20 rounded-3xl border border-white/15 bg-white/5 backdrop-blur flex items-center justify-center">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-white/35" />
            <div className="absolute left-1/2 top-[-2px] -translate-x-1/2 h-3 w-3 rotate-45 border-t-2 border-r-2 border-white/35" />
          </div>
        </div>
        <div className="text-fog uppercase tracking-[0.28em] text-[14px] md:text-[16px]">
          ПОВЕРНИТЕ ТЕЛЕФОН
        </div>
        <div className="text-ash text-[12px] md:text-[13px]">
          Дальше презентация идёт в горизонтальном режиме
        </div>
      </div>
    </div>
  )
}

function SlideFrame({ step, isActive, isMobile, isPortrait, nextId }: { step: DeckStep; isActive: boolean; isMobile: boolean; isPortrait: boolean; nextId?: string }) {
  if (step.kind === "video") {
    return <VideoFrame step={step} isActive={isActive} isMobile={isMobile} isPortrait={isPortrait} nextId={nextId} />
  }

  if (step.kind === "rotate") {
    return <RotateFrame />
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center px-3 py-12 md:px-8">
      <div className={`relative ${isMobile && isPortrait && step.id === "s01" ? "w-[min(100vw,56.25vh)] h-[min(177.777vw,100vh)]" : "w-[min(100vw,177.777vh)] h-[min(56.25vw,100vh)]"}`}>
        {/* ВАЖНО: обычный <img> — без Next/Image оптимайзера (в dev он часто грузит очень медленно). */}
        <img
          src={step.src}
          alt={step.num ? `Слайд ${step.num}` : "Слайд"}
          className={`h-full w-full ${isMobile && isPortrait && step.id === "s01" ? "object-cover" : "object-contain"}`}
          loading={isActive || (step.num ?? 0) <= 2 ? "eager" : "lazy"}
          decoding="async"
        />
        {step.num === 16 && <StorylinesHotspots />}
        {step.num === 38 && <ContactsHotspots />}
      </div>
    </div>
  )
}

export default function Page() {
    const [vw, setVw] = useState(0)
  const [vh, setVh] = useState(0)

  useEffect(() => {
    const on = () => {
      setVw(window.innerWidth)
      setVh(window.innerHeight)
    }
    on()
    window.addEventListener("resize", on)
    window.addEventListener("orientationchange", on)
    return () => {
      window.removeEventListener("resize", on)
      window.removeEventListener("orientationchange", on)
    }
  }, [])

  const isMobile = vw > 0 && vw <= 900
  const isPortrait = vh > vw && vw > 0

  const steps = useMemo(
    () => (isMobile ? STEPS : STEPS.filter((s) => s.kind !== "rotate")),
    [isMobile]
  )

  const { activeId, activeIndex, activeSlide, activeSection } = useActiveSlide(steps)
  useKeyboardNav(activeIndex, steps)

  const deckRef = useRef<HTMLElement | null>(null)

  // Wheel navigation (desktop): treat wheel like slide-by-slide navigation to avoid snap drift when scrolling up.
  useEffect(() => {
    if (isMobile) return
    const el = deckRef.current
    if (!el) return

    let last = 0
    const cooldown = 650
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 12) return
      const now = Date.now()
      if (now - last < cooldown) {
        e.preventDefault()
        return
      }
      last = now
      e.preventDefault()
      const dir = e.deltaY > 0 ? 1 : -1
      const target = clamp(activeIndex + dir, 0, steps.length - 1)
      scrollToId(steps[target].id)
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel as any)
  }, [isMobile, activeIndex, steps])

  // Keep URL hash in sync (приятно для “поделиться ссылкой на слайд”)
  useEffect(() => {
    if (!activeId) return
    const url = new URL(window.location.href)
    url.hash = activeId
    window.history.replaceState({}, "", url.toString())
  }, [activeId])

// If opened with #sXX — jump
  useEffect(() => {
    const id = window.location.hash.replace("#", "")
    if (id && steps.some((s) => s.id === id)) {
      setTimeout(() => scrollToId(id), 50)
    }
  }, [])

  // Prefetch next slides (ускоряет ощущение “презентации”, особенно в dev)
  useEffect(() => {
    if (typeof window === "undefined") return
    const prefetch = (id: string) => {
      const slide = steps.find((s) => s.id === id)
      if (!slide || slide.kind !== "image") return
      const img = new window.Image()
      img.src = slide.src
    }

    const ids = [steps[activeIndex + 1]?.id, steps[activeIndex + 2]?.id, steps[activeIndex + 3]?.id].filter(
      Boolean
    ) as string[]
    ids.forEach(prefetch)
  }, [activeIndex])

  return (
    <main ref={deckRef as any} className="deck">
      {/* Top bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-3 py-1">
          <div className="min-w-0 flex-1">
            <NavPills activeSection={activeSection} />
          </div>

          <div className="pointer-events-none hidden md:block shrink-0 text-right">
            <div className="pointer-events-auto rounded-full border border-white/10 bg-ink/55 px-2 py-1 text-[10px] text-ash backdrop-blur">
              {activeIndex + 1} / {steps.length}
            </div>
          </div>
        </div>
      </div>

      <SectionDots activeSectionId={activeSection.id} />

      {/* Slides */}
      {steps.map((s, i) => (
        <section key={s.id} id={s.id} className="slide bg-ink">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/50" />
          <SlideFrame step={s} isActive={i === activeIndex} isMobile={isMobile} isPortrait={isPortrait} nextId={steps[i + 1]?.id} />
        </section>
      ))}
    </main>
  )
}
