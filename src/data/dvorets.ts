import { type DeckSection, type DeckStep } from "@/data/deck";

// ДВОРЕЦ — презентация (63 слайда) «Тишина на кончиках крыльев»
// Отдельное меню для страницы /dvorets.
// Пункт «СТРОКА» из меню убран: сам слайд сохранён, но включён в раздел «ПРОЕКТ».
// Rotate-подсказка на мобилке убрана полностью.

export const DVO_SECTIONS: DeckSection[] = [
  { id: "project", title: "ПРОЕКТ", from: 1, to: 3 },
  { id: "palace", title: "ДВОРЕЦ", from: 4, to: 7 },
  { id: "heroes", title: "ГЕРОИ", from: 8, to: 11 },
  { id: "looks", title: "ОБРАЗЫ", from: 12, to: 17 },
  { id: "plot", title: "СЮЖЕТ", from: 18, to: 30 },
  { id: "place", title: "МЕСТО", from: 31, to: 41 },
  { id: "visual", title: "ВИЗУАЛ", from: 42, to: 48 },
  { id: "sceno", title: "СЦЕНОГРАФИЯ", from: 49, to: 55 },
  { id: "legacy", title: "НАСЛЕДИЕ", from: 56, to: 63 },
];

function sectionIdFor(n: number): DeckSection["id"] {
  if (n <= 3) return "project";
  if (n >= 4 && n <= 7) return "palace";
  if (n >= 8 && n <= 11) return "heroes";
  if (n >= 12 && n <= 17) return "looks";
  if (n >= 18 && n <= 30) return "plot";
  if (n >= 31 && n <= 41) return "place";
  if (n >= 42 && n <= 48) return "visual";
  if (n >= 49 && n <= 55) return "sceno";
  return "legacy";
}

const IMG = (n: number): DeckStep => {
  const id = `s${String(n).padStart(2, "0")}`;
  return {
    id,
    kind: "image",
    num: n,
    sectionId: sectionIdFor(n),
    src: `/dvorets/slides/slide-${String(n).padStart(2, "0")}.webp`,
  } as DeckStep;
};

export const DVO_STEPS: DeckStep[] = Array.from({ length: 63 }, (_, i) => IMG(i + 1));
