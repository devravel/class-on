interface DonutSegment {
  label: string
  value: number
  color: string
}

interface MiniDonutProps {
  segments: DonutSegment[]
  size?: number
  thickness?: number
  centerValue?: string
  centerLabel?: string
}

export function MiniDonut({
  segments,
  size = 128,
  thickness = 14,
  centerValue,
  centerLabel,
}: MiniDonutProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  const arcs = segments.reduce<{ segment: DonutSegment; start: number }[]>(
    (acc, segment) => {
      const previous = acc[acc.length - 1]
      const start = previous ? previous.start + previous.segment.value : 0
      return [...acc, { segment, start }]
    },
    [],
  )

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label="Gráfico de distribuição de risco pedagógico"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(15, 23, 42, 0.08)"
          strokeWidth={thickness}
        />
        {arcs.map(({ segment, start }) => {
          const fraction = segment.value / total
          const dash = fraction * circumference
          const gap = circumference - dash
          const offset = -(start / total) * circumference

          return (
            <circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-[stroke-dasharray] duration-700 ease-out"
            />
          )
        })}
      </svg>
      {(centerValue || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-lg font-bold text-neutral-900">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-[10px] text-text-secondary">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
