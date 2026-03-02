export const metadata = {
  title: "Дворец — Stroka",
}

export default function DvoretsPage() {
  return (
    <main className="min-h-screen bg-ink text-fog">
      {/* Top bar (minimal) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-2">
          <div className="pointer-events-auto flex items-center gap-2">
            <a
              href="/"
              className="group flex items-center gap-3 rounded-full border border-white/10 bg-ink/60 px-3 py-1.5 backdrop-blur hover:border-white/20"
              aria-label="Перейти: Маяк"
            >
              <span className="h-6 w-6 rounded-full bg-ember/90 shadow-glow" />
              <span className="font-display text-xs uppercase tracking-wide2 text-fog/85 group-hover:text-white">
                МАЯК
              </span>
            </a>

            <span
              className="group flex items-center gap-3 rounded-full border border-white/15 bg-ink/70 px-3 py-1.5 backdrop-blur"
              aria-label="Дворец"
            >
              <span className="h-6 w-6 rounded-full bg-[#7a0e12] shadow-[0_0_18px_rgba(122,14,18,0.35)]" />
              <span className="font-display text-xs uppercase tracking-wide2 text-fog">
                ДВОРЕЦ
              </span>
            </span>
          </div>

          <div className="pointer-events-none hidden md:block" />

          <div className="pointer-events-none hidden md:block" />
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-[860px] text-center">
          <div className="font-display text-[12px] uppercase tracking-wide2 text-ash">Проект</div>
          <h1 className="mt-3 font-display text-3xl md:text-5xl tracking-tight">ДВОРЕЦ</h1>
          <p className="mt-4 text-ash">Черновик страницы. Дальше сюда подключим презентацию так же, как «Маяк».</p>
          <div className="mt-8 flex items-center justify-center">
            <a
              href="/"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs uppercase tracking-wide2 text-fog hover:border-white/30 hover:bg-white/10"
            >
              Перейти к «Маяку»
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
