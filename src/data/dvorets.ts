import { type DeckSection, type DeckStep } from "@/data/deck";

// ДВОРЕЦ — презентация (63 слайда) «Тишина на кончиках крыльев»
// Меню сделано по структуре самих разделителей в презентации:
// «ГЕРОИ», «ВИЗУАЛ», «СЦЕНОГРАФИЯ», «НАСЛЕДИЕ» + логические блоки.

export const DVO_SECTIONS: DeckSection[] = [
  { id: "project", title: "ПРОЕКТ", from: 1, to: 2 },
  { id: "stroka", title: "СТРОКА", from: 3, to: 3 },
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
  if (n <= 2) return "project";
  if (n === 3) return "stroka";
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
  };
};

// Rotate-подсказка: не блокирует, просто информирует.
const ROTATE: DeckStep = {
  id: "r01",
  kind: "rotate",
  sectionId: "project",
  src: "",
};

export const DVO_STEPS: DeckStep[] = [
  ROTATE,
  ...Array.from({ length: 63 }, (_, i) => IMG(i + 1)),
];
