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

        {/* Кнопка в конце — назад к контактам основной презентации */}
        <div className="flex justify-center py-10">
          <a
            href="https://t.me/bekagaev" target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm uppercase tracking-wide2 text-fog hover:border-white/30 hover:bg-white/10"
          >
            Проследовать за светом маяка
          </a>
        </div>
      </div>
    </main>
  )
}
