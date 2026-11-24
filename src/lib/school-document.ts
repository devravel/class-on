/**
 * Documento escolar simulado da importação de alunos: 9 dígitos + 1 verificador
 * (módulo 11), exibido como 000.000.000-0. Mesma regra de
 * backend/src/classes/student-import.ts — o backend revalida ao salvar.
 */

export type ImportIssue =
  | 'NOME_INCOMPLETO'
  | 'DOCUMENTO_INVALIDO'
  | 'DUPLICADO_NO_ARQUIVO'
  | 'JA_CADASTRADO'

export const IMPORT_ISSUE_LABELS: Record<ImportIssue, string> = {
  NOME_INCOMPLETO: 'Nome incompleto',
  DOCUMENTO_INVALIDO: 'Documento inválido',
  DUPLICADO_NO_ARQUIVO: 'Documento repetido',
  JA_CADASTRADO: 'Já matriculado',
}

export function formatSchoolDocument(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length !== 10) return raw.trim()
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits[9]}`
}

export function isValidSchoolDocument(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 10 || /^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i)
  const rest = 11 - (sum % 11)
  return (rest >= 10 ? 0 : rest) === Number(digits[9])
}

/** Problemas de cada linha. `registered` = documentos que o backend disse que já existem. */
export function findImportIssues(
  rows: Array<{ full_name: string; document: string }>,
  registered: Set<string>,
): ImportIssue[][] {
  const count = new Map<string, number>()
  for (const row of rows) {
    const doc = formatSchoolDocument(row.document)
    count.set(doc, (count.get(doc) ?? 0) + 1)
  }

  return rows.map((row) => {
    const doc = formatSchoolDocument(row.document)
    const issues: ImportIssue[] = []
    if (row.full_name.trim().split(/\s+/).length < 2) issues.push('NOME_INCOMPLETO')
    if (!isValidSchoolDocument(doc)) issues.push('DOCUMENTO_INVALIDO')
    else if ((count.get(doc) ?? 0) > 1) issues.push('DUPLICADO_NO_ARQUIVO')
    else if (registered.has(doc)) issues.push('JA_CADASTRADO')
    return issues
  })
}
