/**
 * Importação de lista de alunos por arquivo (assistente de turma).
 *
 * O arquivo traz um aluno por entrada no padrão
 *   Nome: Maria Clara Souza, Documento: 123.456.789-0
 * (na mesma linha, separado por vírgula/; /|, ou com "Documento:" na linha de baixo).
 *
 * "Documento" é um documento escolar simulado — não é CPF nem RG: 9 dígitos +
 * 1 dígito verificador (módulo 11). O verificador é o que permite apontar, na
 * prévia, documento digitado errado.
 */

const ENTRY_PATTERN =
  // O documento não pode atravessar quebra de linha: no PDF a linha seguinte
  // começa com o número do item ("2. Nome: …") e era engolida junto.
  /Nome\s*:\s*([^\n\r,;|]+?)\s*(?:[,;|]\s*|\r?\n\s*)Documento\s*:[ \t]*([0-9][0-9. \t-]{6,18}[0-9])/gi

const NAME_PARTICLES = new Set(['da', 'das', 'de', 'do', 'dos', 'e'])

export type ImportedRowIssue =
  | 'NOME_INCOMPLETO'
  | 'DOCUMENTO_INVALIDO'
  | 'DUPLICADO_NO_ARQUIVO'
  | 'JA_CADASTRADO'

export interface ParsedStudentRow {
  full_name: string
  document: string
}

function checkDigit(nineDigits: string): number {
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(nineDigits[i]) * (10 - i)
  const rest = 11 - (sum % 11)
  return rest >= 10 ? 0 : rest
}

/** "1234567890", "123.456.789-0" → "123.456.789-0"; formato errado → null. */
export function formatSchoolDocument(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 10) return null
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits[9]}`
}

export function isValidSchoolDocument(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 10 || /^(\d)\1+$/.test(digits)) return false
  return checkDigit(digits.slice(0, 9)) === Number(digits[9])
}

/** "MARIA CLARA DA SILVA" / "maria  clara da silva" → "Maria Clara da Silva". */
export function normalizeStudentName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('pt-BR')
    .split(' ')
    .map((word, index) =>
      index > 0 && NAME_PARTICLES.has(word)
        ? word
        : word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1),
    )
    .join(' ')
}

/** Extrai os pares Nome/Documento do texto e conta as menções a "Nome:" que não casaram. */
export function parseStudentList(text: string): {
  rows: ParsedStudentRow[]
  ignored: number
} {
  // Markdown (negrito, títulos, citações) e espaços duros do PDF atrapalham o padrão.
  const clean = text.replace(/[*_`#>]/g, ' ').replace(/ /g, ' ')
  const rows: ParsedStudentRow[] = []

  for (const match of clean.matchAll(ENTRY_PATTERN)) {
    rows.push({
      full_name: normalizeStudentName(match[1]),
      document: formatSchoolDocument(match[2]) ?? match[2].trim(),
    })
  }

  const mentions = clean.match(/Nome\s*:/gi)?.length ?? 0
  return { rows, ignored: Math.max(0, mentions - rows.length) }
}

/** Problemas de cada linha. `registered` = documentos que já existem no banco. */
export function findRowIssues(
  rows: ParsedStudentRow[],
  registered: Set<string>,
): ImportedRowIssue[][] {
  const seen = new Map<string, number>()
  for (const row of rows) seen.set(row.document, (seen.get(row.document) ?? 0) + 1)

  return rows.map((row) => {
    const issues: ImportedRowIssue[] = []
    if (row.full_name.split(' ').length < 2) issues.push('NOME_INCOMPLETO')
    if (!isValidSchoolDocument(row.document)) issues.push('DOCUMENTO_INVALIDO')
    else if ((seen.get(row.document) ?? 0) > 1) issues.push('DUPLICADO_NO_ARQUIVO')
    else if (registered.has(row.document)) issues.push('JA_CADASTRADO')
    return issues
  })
}
