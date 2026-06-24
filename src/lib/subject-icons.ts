import {
  Atom,
  BookOpen,
  Calculator,
  Dumbbell,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  Palette,
  type LucideIcon,
} from 'lucide-react'

const PARTIAL_ICON_RULES: Array<[string, LucideIcon]> = [
  ['lingua inglesa', Languages],
  ['lingua portuguesa', BookOpen],
  ['educacao fisica', Dumbbell],
  ['matematica', Calculator],
  ['portugues', BookOpen],
  ['ciencias', FlaskConical],
  ['biologia', FlaskConical],
  ['quimica', FlaskConical],
  ['fisica', Atom],
  ['historia', Landmark],
  ['geografia', Globe],
  ['arte', Palette],
  ['artes', Palette],
  ['musica', Palette],
  ['ingles', Languages],
]

function normalizeSubjectName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function getSubjectIcon(subjectName: string): LucideIcon {
  const normalized = normalizeSubjectName(subjectName)

  for (const [keyword, icon] of PARTIAL_ICON_RULES) {
    if (normalized.includes(keyword)) {
      return icon
    }
  }

  return BookOpen
}
