import Link from "next/link";

export const metadata = {
  title: "Дворец — Stroka",
};

export default function DvoretsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* background image (already приглушено в файле) */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: "url(/dvorets/gates.webp)" }}
        aria-hidden="true"
      />

      {/* content overlay */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="max-w-[720px] text-center">
          <div className="text-[12px] text-fog/70 uppercase tracking-wide2">Проект</div>
          <h1 className="mt-3 font-display text-[44px] md:text-[64px] uppercase tracking-wide2">
            ДВОРЕЦ
          </h1>
          <div className="mt-2 text-[16px] md:text-[18px] text-fog/80">
            Скоро ворота будут открыты
          </div>

          <div className="mt-8 flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-ink/55 px-5 py-3 text-[14px] text-fog backdrop-blur hover:border-white/25"
            >
              Перейти к «Маяку»
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
