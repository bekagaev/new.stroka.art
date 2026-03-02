export const metadata = {
  title: "Дворец — Stroka",
}

export default function DvoretsPage() {
  return (
    <main className="min-h-[100dvh] bg-ink text-fog">
      {/* Subtle background */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/dvorets/gates.jpg"
          alt=""
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/75" />
      </div>

      <div className="mx-auto flex min-h-[100dvh] max-w-[1200px] flex-col items-center justify-center px-6 text-center">
        <div className="font-display text-[12px] uppercase tracking-wide2 text-ash">Проект</div>
        <h1 className="font-display text-[44px] md:text-[72px] tracking-tight text-fog mt-2">ДВОРЕЦ</h1>
        <p className="mt-6 max-w-[720px] text-[16px] md:text-[18px] text-fog/80">
          Скоро ворота будут открыты
        </p>

        <a
          href="/#s01"
          className="mt-10 inline-flex items-center justify-center rounded-full border border-white/15 bg-ink/50 px-8 py-3 font-display text-[12px] uppercase tracking-wide2 text-fog backdrop-blur hover:border-white/25"
        >
          Перейти к «Маяку»
        </a>
      </div>
    </main>
  )
}
