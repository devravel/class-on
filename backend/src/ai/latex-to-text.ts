/**
 * O modelo de tarefas escreve fórmulas em LaTeX mesmo quando o prompt proíbe,
 * e a tela do aluno mostra Markdown, não LaTeX ("\log_5 25" aparecia cru).
 * Converte o LaTeX comum de exercício escolar em texto Unicode legível.
 *
 * ponytail: cobre o que aparece em tarefa de ensino básico (log, frações,
 * raízes, potências, índices, operadores, gregas comuns). Fórmula exótica cai
 * no fallback (tira a barra do comando); se virar problema, renderizar com KaTeX.
 */

const SUPERSCRIPT: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', n: 'ⁿ', x: 'ˣ', i: 'ⁱ', y: 'ʸ', a: 'ᵃ', b: 'ᵇ', k: 'ᵏ', m: 'ᵐ',
}
const SUBSCRIPT: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', x: 'ₓ', n: 'ₙ', b: 'ᵦ',
}
const SYMBOLS: Record<string, string> = {
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠',
  approx: '≈', equiv: '≡', infty: '∞', to: '→', rightarrow: '→', Rightarrow: '⇒', leftarrow: '←',
  pi: 'π', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ', theta: 'θ', lambda: 'λ', mu: 'μ', sigma: 'σ',
  degree: '°', circ: '°', percent: '%', ldots: '…', cdots: '…', in: '∈', cup: '∪', cap: '∩', angle: '∠',
}

function mapAll(text: string, table: Record<string, string>): string | null {
  let out = ''
  for (const char of text) {
    const mapped = table[char]
    if (mapped === undefined) return null
    out += mapped
  }
  return out
}

function script(body: string, table: Record<string, string>, marker: string): string {
  const clean = body.replace(/\s+/g, '')
  return mapAll(clean, table) ?? `${marker}(${body})`
}

export function latexToText(markdown: string): string {
  let text = markdown
    // Delimitadores de fórmula: \( \) \[ \] $$ $
    .replace(/\\\[|\\\]|\\\(|\\\)/g, '')
    .replace(/\$\$([\s\S]+?)\$\$/g, '$1')
    // $x^2$ sim; "R$ 5,00 e R$ 10,00" não (sem R antes, sem espaço colado no $).
    .replace(/(?<![R\w])\$(?=\S)([^$\n]+?)(?<=\S)\$(?!\d)/g, '$1')
    // Envoltórios sem significado visual
    .replace(/\\(left|right|displaystyle|,|;|!|quad|qquad)/g, (_, name: string) => (name.length > 1 ? '' : ' '))
    .replace(/\\(?:text|mathrm|mathbf|operatorname)\{([^{}]*)\}/g, '$1')

  // Estruturas com chaves; repete para resolver aninhamento simples.
  for (let pass = 0; pass < 3; pass++) {
    text = text
      .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_, a: string, b: string) =>
        /^\w+$/.test(a) && /^\w+$/.test(b) ? `${a}/${b}` : `(${a})/(${b})`,
      )
      .replace(/\\sqrt\[([^\]]+)\]\{([^{}]*)\}/g, (_, n: string, x: string) => `${script(n, SUPERSCRIPT, '^')}√(${x})`)
      .replace(/\\sqrt\{([^{}]*)\}/g, (_, x: string) => (/^\w+$/.test(x) ? `√${x}` : `√(${x})`))
  }

  return text
    .replace(/\\(log|ln|sin|cos|tan|exp|lim)\b/g, '$1')
    .replace(/\^\{([^{}]*)\}/g, (_, body: string) => script(body, SUPERSCRIPT, '^'))
    .replace(/\^([0-9a-z+-])/g, (_, c: string) => SUPERSCRIPT[c] ?? `^${c}`)
    .replace(/_\{([^{}]*)\}/g, (_, body: string) => script(body, SUBSCRIPT, '_'))
    .replace(/(\b(?:log|ln))_([0-9a-z])/g, (_, fn: string, c: string) => fn + (SUBSCRIPT[c] ?? `_${c}`))
    .replace(/\\([a-zA-Z]+)/g, (_, name: string) => SYMBOLS[name] ?? name)
    .replace(/\\([%{}#&_])/g, '$1')
}
