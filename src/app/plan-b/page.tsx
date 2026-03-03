export const metadata = {
  title: "Маяк — План Б",
}

const PARTS = Array.from({ length: 8 }, (_, i) => `/plan-b/planb-${String(i + 1).padStart(2, "0")}.webp`)

export default function PlanBPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* Без навигации — просто прокрутка как лендинг */}
      <div className="mx-auto w-full max-w-[1400px] px-3 py-6 md:px-6">
        <div className="space-y-0">
          {PARTS.map((src, idx) => (
            <img
              key={src}
              src={src}
              alt={`План Б — часть ${idx + 1}`}
              className="w-full h-auto block"
              loading={idx <= 1 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>

        {/* Кнопки в конце */}
        <div className="flex flex-col items-center gap-3 pt-4 pb-8 sm:flex-row sm:justify-center sm:gap-4 sm:pt-8 sm:pb-10">
          <a
            href="https://t.me/bekagaev"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full max-w-[360px] items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-[11px] uppercase tracking-wide2 text-fog hover:border-white/30 hover:bg-white/10 whitespace-nowrap sm:w-auto sm:px-7 sm:py-4 sm:text-sm"
          >
            Проследовать за светом маяка
          </a>

          <a
            href="/#s01"
            className="inline-flex w-full max-w-[360px] items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-[11px] uppercase tracking-wide2 text-fog hover:border-white/30 hover:bg-white/10 whitespace-nowrap sm:w-auto sm:px-7 sm:py-4 sm:text-sm"
          >
            Вернуться к плану А
          </a>
        </div>
      </div>
    </main>
  )
}
