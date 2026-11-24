import { formatGrade, formatPercent } from '@/lib/format'
import type { StudentRiskEntry } from '@/types/analytics'

const CATEGORY_LABEL: Record<StudentRiskEntry['category'], string> = {
  RISCO_CRITICO: 'Risco crítico',
  ALERTA: 'Atenção',
  ESTAVEL: 'Estável',
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

/** O texto da IA vem em Markdown simples: parágrafos, **negrito** e listas com "-". */
function markdownToHtml(markdown: string) {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const html = escapeHtml(block)
        .replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      const lines = html.split('\n')
      const isItem = (line: string) => /^\s*[-•*]\s+/.test(line)
      // Bloco "frase de abertura + itens" (comum na saída da IA): texto em <p>, itens em <ul>.
      const firstItem = lines.findIndex(isItem)
      if (firstItem !== -1 && lines.slice(firstItem).every(isItem)) {
        const lead = lines.slice(0, firstItem)
        const items = lines.slice(firstItem).map((line) => `<li>${line.replace(/^\s*[-•*]\s+/, '')}</li>`)
        return `${lead.length ? `<p>${lead.join('<br>')}</p>` : ''}<ul>${items.join('')}</ul>`
      }
      return `<p>${lines.join('<br>')}</p>`
    })
    .join('')
}

/**
 * Abre a impressão do navegador com a carta formatada em A4 ("Salvar como PDF").
 * Iframe escondido em vez de janela nova: não esbarra em bloqueador de pop-up e
 * não leva o CSS do app junto.
 */
export function printParentLetter(student: StudentRiskEntry, letter: string) {
  const now = new Date()
  const longDate = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const stamp = now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  const indicators = [
    `RM ${escapeHtml(student.rm)}`,
    student.grade_average != null ? `Média geral ${formatGrade(student.grade_average)}` : null,
    student.attendance_rate != null ? `Frequência ${formatPercent(student.attendance_rate)}` : null,
    `Índice de risco ${student.score} · ${CATEGORY_LABEL[student.category]}`,
  ].filter(Boolean)

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Comunicado aos responsáveis — ${escapeHtml(student.full_name)}</title>
<style>
  @page { size: A4; margin: 20mm 22mm 18mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 11.5pt/1.6 "Segoe UI", Arial, sans-serif; color: #141a33; }
  header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 2px solid #1f63dc; }
  .brand { display: flex; align-items: center; gap: 10px; font-size: 18pt; font-weight: 800; letter-spacing: -0.02em; color: #0c1026; }
  .brand img { width: 40px; height: 34px; }
  .kind { text-align: right; font-size: 9.5pt; color: #4a5373; }
  .kind strong { display: block; font-size: 11pt; color: #1f63dc; }
  .student { margin: 22px 0 18px; padding: 12px 16px; border-radius: 10px; background: #eef3fd; }
  .student .name { font-size: 13pt; font-weight: 700; }
  .student .facts { margin-top: 2px; font-size: 9.5pt; color: #4a5373; }
  .date { margin: 0 0 14px; text-align: right; color: #4a5373; font-size: 10pt; }
  main p { margin: 0 0 10px; text-align: justify; }
  main ul { margin: 0 0 10px 18px; padding: 0; }
  .sign { margin-top: 46px; width: 260px; border-top: 1px solid #141a33; padding-top: 6px; font-size: 10pt; }
  footer { margin-top: 34px; padding-top: 10px; border-top: 1px solid #d6dcea; font-size: 8.5pt; color: #6b7390; }
</style></head>
<body>
  <header>
    <div class="brand"><img src="${window.location.origin}/icon.svg" alt="">ClassOn</div>
    <div class="kind"><strong>Comunicado aos responsáveis</strong>Coordenação pedagógica</div>
  </header>
  <section class="student">
    <div class="name">${escapeHtml(student.full_name)}</div>
    <div class="facts">${indicators.join(' &nbsp;·&nbsp; ')}</div>
  </section>
  <p class="date">${longDate}</p>
  <main>${markdownToHtml(letter)}</main>
  <div class="sign">Coordenação Pedagógica</div>
  <footer>Documento gerado pelo ClassOn em ${stamp}. Os indicadores vêm das notas e da frequência registradas no sistema.</footer>
</body></html>`

  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  const win = iframe.contentWindow
  if (!doc || !win) {
    iframe.remove()
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  // Espera a logo carregar, senão o PDF sai sem ela.
  const print = () => {
    win.focus()
    win.print()
    setTimeout(() => iframe.remove(), 1000)
  }
  const logo = doc.querySelector('img')
  if (logo && !logo.complete) {
    logo.addEventListener('load', print, { once: true })
    logo.addEventListener('error', print, { once: true })
  } else {
    print()
  }
}
