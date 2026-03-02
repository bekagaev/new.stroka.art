export type DeckSection = {
  id: string
  title: string
  from: number
  to: number
}

export type DeckStepKind = 'image' | 'video' | 'rotate'

export type DeckStep = {
  /** DOM id / hash anchor (e.g. s01, v01) */
  id: string
  kind: DeckStepKind
  /** Slide number for image steps (1..38). Undefined for videos. */
  num?: number
  sectionId: string
  src: string
  poster?: string
}

export const SECTIONS: DeckSection[] = [
  { id: 'stroka', title: 'Строка', from: 1, to: 7 },
  { id: 'project', title: 'Проект', from: 8, to: 14 },
  { id: 'route', title: 'Маршрут', from: 15, to: 15 },
  { id: 'characters', title: 'Персонажи', from: 16, to: 18 },
  { id: 'costumes', title: 'Костюмы', from: 19, to: 23 },
  { id: 'episodes', title: 'Эпизоды', from: 24, to: 34 },
  { id: 'why', title: 'Почему мы', from: 35, to: 37 },
  { id: 'contact', title: 'Контакты', from: 38, to: 38 },
]

function sectionIdFor(num: number) {
  const s = SECTIONS.find((x) => num >= x.from && num <= x.to)
  return s?.id ?? 'deck'
}

export const STEPS: DeckStep[] = [
  // Slide 01
  {
    num: 1,
    id: 's01',
    src: '/slides/slide-01.webp',
    sectionId: sectionIdFor(1),
    kind: 'image' as const,
  },
  // Mobile: rotate hint between first slide and the rest
  {
    id: 'r01',
    kind: 'rotate',
    sectionId: 'stroka',
    src: '',
  },
  // Slide 02
  {
    num: 2,
    id: 's02',
    src: '/slides/slide-02.webp',
    sectionId: sectionIdFor(2),
    kind: 'image' as const,
  },
  // Video between 02 and 03
  {
    id: 'v01',
    kind: 'video',
    sectionId: 'stroka',
    src: '/media/01.mp4',
    poster: '/slides/slide-02.webp',
  },
  // Slides 03..38
  ...Array.from({ length: 36 }, (_, i) => {
    const num = i + 3
    return {
      num,
      id: `s${String(num).padStart(2, '0')}`,
      src: `/slides/slide-${String(num).padStart(2, '0')}.webp`,
      sectionId: sectionIdFor(num),
      kind: 'image' as const,
    }
  }),
]
