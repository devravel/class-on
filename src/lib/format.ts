import type { Announcement } from '@/types/announcement'

const grade = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

/** Nota e média no padrão brasileiro: 8,5 (nunca 8.5). */
export function formatGrade(value: number): string {
  return grade.format(value)
}

/** Percentual sem ",0" sobrando: 90% · 87,5%. */
export function formatPercent(value: number): string {
  return `${percent.format(value)}%`
}

/** Prévia de uma linha de texto em Markdown (tarefa gerada pela IA): sem #, **, --- nem LaTeX. */
export function markdownPreview(markdown: string): string {
  return markdown
    .replace(/\\[[\]()]/g, '')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/^\s{0,3}(#{1,6}|[-*]{3,}|>)\s*/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/(\*\*|__|\*|_|`)(.+?)\1/g, '$2')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Quem assina o comunicado: nome do professor, "Secretaria" ou, em último caso, o e-mail. */
export function announcementAuthor(users: Announcement['users']): string {
  return users.teachers?.full_name ?? (users.role === 'SECRETARIA' ? 'Secretaria' : users.email)
}
