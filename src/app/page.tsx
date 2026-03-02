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


function DeckFullscreenButton() {
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    // Fullscreen API is not reliably supported on iOS Safari for the whole page.
    setEnabled(!!document.fullscreenEnabled)
    const onChange = () => setActive(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  if (!enabled) return null

  return (
    <button
      onClick={async () => {
        try {
          if (document.fullscreenElement) await document.exitFullscreen()
          else await document.documentElement.requestFullscreen()
        } catch {}
      }}
      className="pointer-events-auto inline-flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-white/10 bg-ink/55 text-[12px] text-fog backdrop-blur hover:border-white/20"
      aria-label={active ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
      title={active ? "Exit fullscreen" : "Fullscreen"}
      type="button"
    >
      ⛶
    </button>
  )
}


function NavPills({ activeSection }: { activeSection: DeckSection }) {
  const projectBtn =
    "shrink-0 flex h-7 md:h-8 items-center rounded-full border border-white/10 bg-ink/60 px-3 md:px-4 py-1 backdrop-blur hover:border-white/20 whitespace-nowrap"
  const sectionGroup =
    "shrink-0 flex h-7 md:h-8 items-center rounded-full border border-white/10 bg-ink/35 px-2 md:px-3 py-1 backdrop-blur overflow-x-auto no-scrollbar whitespace-nowrap"
  const sectionItem = "shrink-0 rounded-full px-2 md:px-3 py-1"
  const textBase = "font-display text-[10px] md:text-[11px] lg:text-[12px] uppercase tracking-wide2"

  return (
    <div className="pointer-events-auto flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
      {/* Проекты — две отдельные кнопки */}
      <a href="/dvorets" className={`${projectBtn} gap-2`} aria-label="Перейти: Дворец">
        <span className="h-5 w-5 rounded-full bg-[#7a0e12] shadow-[0_0_18px_rgba(122,14,18,0.35)]" />
        <span className={`${textBase} text-fog/85 hover:text-white`}>ДВОРЕЦ</span>
      </a>

      <button onClick={() => scrollToId("s01")} className={`${projectBtn} gap-2`} aria-label="К началу: Маяк" type="button">
        <span className="h-5 w-5 rounded-full bg-ember/90 shadow-glow" />
        <span className={`${textBase} text-fog hover:text-white`}>МАЯК</span>
      </button>

      {/* Разделы — общий контур, без индивидуальных контуров внутри */}
      <div className={sectionGroup} aria-label="Разделы презентации">
        {SECTIONS.map((s) => {
          const isActive = activeSection.id === s.id
          return (
            <button
              key={s.id}
              onClick={() => scrollToId(`s${String(s.from).padStart(2, "0")}`)}
              className={`${sectionItem} ${isActive ? "bg-white/12" : "hover:bg-white/5"}`}
              aria-label={`Перейти: ${s.title}`}
              type="button"
            >
              <span className={`${textBase} ${isActive ? "text-fog" : "text-ash hover:text-fog"}`}>{s.title}</span>
            </button>
          )
        })}
      </div>
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
  // Невидимые крупные зоны без hover-анимаций: важно просто попадание по областям.
  return (
    <div className="absolute inset-0">
      {/* Изучить план Б — верхняя зона */}
      <a
        href="/plan-b"
        className="absolute left-[12%] top-[6%] h-[12%] w-[76%] cursor-pointer rounded-xl"
        aria-label="Изучить план Б"
      />

      {/* Telegram — центральный блок */}
      <a
        href="https://t.me/bekagaev"
        target="_blank"
        rel="noreferrer"
        className="absolute left-[10%] top-[43%] h-[30%] w-[80%] cursor-pointer rounded-xl"
        aria-label="Telegram"
      />

      {/* Stroka — логотип снизу */}
      <a
        href="https://stroka.art/"
        target="_blank"
        rel="noreferrer"
        className="absolute left-[4%] top-[66%] h-[32%] w-[86%] cursor-pointer rounded-xl"
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
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const v = ref.current
    if (!v) return

    if (!isActive) {
      v.pause()
      return
    }

    // Автозапуск: в большинстве браузеров возможен только muted.
    const tryPlay = async () => {
      try {
        v.muted = true
        setMuted(true)
        await v.play()
        setBlocked(false)
      } catch {
        setBlocked(true)
      }
    }

    tryPlay()
  }, [isActive])

  const enterVideoFullscreen = async () => {
    const v: any = ref.current
    if (!v) return
    try {
      if (v.requestFullscreen) await v.requestFullscreen()
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen() // iOS native video fullscreen
    } catch {}
  }

  const toggleMute = async () => {
    const v = ref.current
    if (!v) return
    try {
      const nextMuted = !muted
      v.muted = nextMuted
      setMuted(nextMuted)
      if (v.paused) await v.play()
    } catch {}
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center px-3 py-12 md:px-8">
      <div
        className={`relative ${
          isMobile && isPortrait && step.id === "s01"
            ? "w-[min(100vw,56.25vh)] h-[min(177.777vw,100vh)]"
            : "w-[min(100vw,177.777vh)] h-[min(56.25vw,100vh)]"
        }`}
      >
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

        {/* маленькая кнопка fullscreen в углу видео */}
        <button
          onClick={enterVideoFullscreen}
          type="button"
          aria-label="Fullscreen video"
          title="Fullscreen"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-ink/40 text-fog backdrop-blur hover:border-white/30"
        >
          ⛶
        </button>

        {/* кнопка звука */}
        <button
          onClick={toggleMute}
          type="button"
          aria-label={muted ? "Включить звук" : "Выключить звук"}
          title={muted ? "Sound on" : "Sound off"}
          className="absolute right-3 top-12 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-ink/40 text-fog backdrop-blur hover:border-white/30"
        >
          {muted ? "🔇" : "🔊"}
        </button>

        {/* если браузер заблокировал запуск (редко, но бывает) — показываем кнопку */}
        {blocked && (
          <button
            onClick={async () => {
              const v = ref.current
              if (!v) return
              try {
                v.muted = false
                setMuted(false)
                await v.play()
                setBlocked(false)
              } catch {
                setBlocked(true)
              }
            }}
            className="absolute inset-0 flex items-center justify-center"
            aria-label="Воспроизвести"
            type="button"
          >
            <span className="rounded-full border border-white/25 bg-ink/55 px-4 py-3 text-xs text-fog backdrop-blur hover:border-white/35">
              ▶ Воспроизвести
            </span>
          </button>
        )}

        {/* если пользователь поставил паузу — показываем маленький play */}
        {!blocked && !isPlaying && (
          <button
            onClick={async () => {
              const v = ref.current
              if (!v) return
              try {
                await v.play()
              } catch {
                setBlocked(true)
              }
            }}
            className="absolute inset-0 flex items-center justify-center"
            aria-label="Воспроизвести"
            type="button"
          >
            <span className="rounded-full border border-white/15 bg-ink/35 px-3 py-2 text-xs text-fog backdrop-blur hover:border-white/25">
              ▶
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
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(900px 500px at 70% 20%, rgba(255,190,120,0.08), transparent 55%), radial-gradient(800px 420px at 30% 80%, rgba(120,170,255,0.08), transparent 55%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-3 px-8 text-center">
        <div className="text-fog uppercase tracking-[0.28em] text-[14px] md:text-[16px]">
          Поверните телефон
        </div>
        <div className="text-ash text-[12px] md:text-[13px]">
          Презентация идет в горизонтальном режиме
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
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`)
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

          <div className="pointer-events-auto shrink-0 flex items-center gap-2">
            <DeckFullscreenButton />
            <div className="hidden md:block rounded-full border border-white/10 bg-ink/55 px-2 py-1 text-[10px] text-ash backdrop-blur">
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
