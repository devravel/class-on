'use client'

import { cn } from '@/lib/utils'

/**
 * Marca do ClassOn: o capelo solto, sem contêiner.
 *
 * Sem tile de propósito — com uma caixa em volta a marca sempre lê como
 * "ícone dentro de um quadrado + texto ao lado", nunca como uma coisa só.
 * O volume vem das duas faces em tons diferentes, não de uma moldura.
 *
 * Desenhada à mão em SVG: o gerador de imagem grátis derrete geometria, então
 * logo nunca sai de IA (regra do workspace).
 *
 * A geometria vive aqui e em `src/app/icon.svg` (favicon, que precisa ser
 * arquivo estático). Mexeu num, mexe no outro.
 */

type Tone = 'brand' | 'mono'

interface LogoMarkProps {
  /** Altura da marca em px. A largura sai proporcional (1.2×). */
  size?: number
  /** `mono` pinta tudo em branco, pro trilho escuro. */
  tone?: Tone
  className?: string
}

export function LogoMark({ size = 36, tone = 'brand', className }: LogoMarkProps) {
  const mono = tone === 'mono'
  const prancha = mono ? '#FFFFFF' : '#32B7F0'
  const copa = mono ? '#FFFFFF' : '#1B63E4'
  const copaOpacity = mono ? 0.72 : 1
  const borla = mono ? '#FFFFFF' : '#1B63E4'

  return (
    <svg
      width={size * 1.2}
      height={size}
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* Copa primeiro: a prancha é desenhada por cima e cobre a emenda */}
      <path
        d="M11 17.3 L24 22.9 L37 17.3 L35.4 25.9 C35.4 30.1 12.6 30.1 12.6 25.9 Z"
        fill={copa}
        fillOpacity={copaOpacity}
      />

      {/* Borla: nasce logo abaixo da ponta direita da prancha, nunca por cima
          dela — em cima, na versão mono (tudo branco), o cordão sumiria. */}
      <path
        d="M43 15.8 V24.3"
        stroke={borla}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="43" cy="26.9" r="2.6" fill={borla} />

      {/* Prancha */}
      <path d="M24 6 L44 14.4 L24 22.8 L4 14.4 Z" fill={prancha} />
    </svg>
  )
}

interface LogoProps {
  /** `mark` mostra só o capelo — usado no trilho colapsado. */
  variant?: 'full' | 'mark'
  size?: number
  tone?: Tone
  /** Linha de apoio sob o nome. */
  tagline?: boolean
  className?: string
}

export function Logo({
  variant = 'full',
  size = 36,
  tone = 'brand',
  tagline = false,
  className,
}: LogoProps) {
  if (variant === 'mark') {
    return (
      <span className={cn('inline-flex', className)} role="img" aria-label="ClassOn">
        <LogoMark size={size} tone={tone} />
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center', className)}
      role="img"
      aria-label={tagline ? 'ClassOn — Sistema de gestão escolar' : 'ClassOn'}
    >
      <LogoMark size={size} tone={tone} />
      <span
        className="flex flex-col justify-center"
        // A arte é centrada no viewBox, então aqui não precisa da correção
        // vertical que o desenho antigo (com rabicho) exigia.
        style={{ marginLeft: size * 0.16 }}
      >
        <span
          className="font-display font-extrabold leading-none tracking-[-0.035em]"
          style={{ fontSize: size * 0.58 }}
        >
          ClassOn
        </span>
        {tagline && (
          <span
            className="font-sans font-normal leading-none opacity-60"
            style={{ fontSize: size * 0.21, marginTop: size * 0.13 }}
          >
            Sistema de gestão escolar
          </span>
        )}
      </span>
    </span>
  )
}
