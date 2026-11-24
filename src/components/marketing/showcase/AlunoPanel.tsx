const BOLETIM = [
  { subject: 'Matemática', n1: 8.5, n2: 7.0, media: 7.8, status: 'Aprovado' },
  { subject: 'Português', n1: 9.0, n2: 8.5, media: 8.8, status: 'Aprovado' },
  { subject: 'Física', n1: 5.0, n2: 4.0, media: 4.5, status: 'Recuperação' },
]

const FREQUENCIA = [
  { subject: 'Matemática', rate: 94 },
  { subject: 'Português', rate: 88 },
  { subject: 'Física', rate: 71 },
]

export function AlunoPanel() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
          3º Ano A · 2º Bimestre
        </p>
        <h3 className="text-lg font-semibold text-neutral-900">Meu Boletim</h3>
      </div>

      <div className="overflow-hidden rounded-xl bg-surface shadow-card">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-surface-muted text-left text-[10px] uppercase tracking-wide text-text-secondary">
              <th scope="col" className="px-3 py-2 font-medium">Disciplina</th>
              <th scope="col" className="px-2 py-2 text-center font-medium">N1</th>
              <th scope="col" className="px-2 py-2 text-center font-medium">N2</th>
              <th scope="col" className="px-2 py-2 text-center font-medium">Média</th>
              <th scope="col" className="px-3 py-2 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {BOLETIM.map((row) => (
              <tr key={row.subject}>
                <td className="px-3 py-2 font-medium text-neutral-800">{row.subject}</td>
                <td className="px-2 py-2 text-center text-neutral-600">{row.n1.toFixed(1)}</td>
                <td className="px-2 py-2 text-center text-neutral-600">{row.n2.toFixed(1)}</td>
                <td
                  className={`px-2 py-2 text-center font-bold ${
                    row.media >= 6 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {row.media.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      row.status === 'Aprovado'
                        ? 'bg-success-soft text-success'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex-1 rounded-xl bg-surface p-4 shadow-card">
        <p className="mb-3 text-xs font-semibold text-neutral-700">Frequência por Disciplina</p>
        <ul className="space-y-3">
          {FREQUENCIA.map((item) => {
            const isHealthy = item.rate >= 75
            return (
              <li key={item.subject}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-neutral-700">{item.subject}</span>
                  <span
                    className={`font-bold ${isHealthy ? 'text-success' : 'text-danger'}`}
                  >
                    {item.rate}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isHealthy ? 'bg-success' : 'bg-danger'
                    }`}
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
