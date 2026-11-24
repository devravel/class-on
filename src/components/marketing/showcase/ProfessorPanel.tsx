import { Sparkles, UserCheck, UserX } from 'lucide-react'

const GRADES = [
  {
    name: 'Ana Beatriz Souza',
    rm: '2026041',
    n1: 8.5,
    n2: 7.0,
    n3: 9.0,
    n4: 8.0,
    media: 8.1,
    status: 'Aprovado',
  },
  {
    name: 'Carlos Eduardo Lima',
    rm: '2026042',
    n1: 5.0,
    n2: 4.5,
    n3: 6.0,
    n4: 5.5,
    media: 5.3,
    status: 'Recuperação',
  },
  {
    name: 'Fernanda Alves Rocha',
    rm: '2026043',
    n1: 9.0,
    n2: 9.5,
    n3: 8.5,
    n4: 9.0,
    media: 9.0,
    status: 'Aprovado',
  },
]

const ATTENDANCE = [
  { name: 'Ana Beatriz Souza', present: true },
  { name: 'Carlos Eduardo Lima', present: true },
  { name: 'Fernanda Alves Rocha', present: false },
]

export function ProfessorPanel() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
            Matemática · 3º Ano A
          </p>
          <h3 className="text-lg font-semibold text-neutral-900">
            Lançamento de Notas — 2º Bimestre
          </h3>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1.5 text-[11px] font-semibold text-brand-700">
          <Sparkles size={12} />
          Plano de Aula com IA
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl bg-surface shadow-card">
        <table className="w-full min-w-[440px] text-[11px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-surface-muted text-left text-[10px] uppercase tracking-wide text-text-secondary">
              <th scope="col" className="px-3 py-2 font-medium">Aluno</th>
              <th scope="col" className="px-2 py-2 text-center font-medium">N1</th>
              <th scope="col" className="px-2 py-2 text-center font-medium">N2</th>
              <th scope="col" className="px-2 py-2 text-center font-medium">N3</th>
              <th scope="col" className="px-2 py-2 text-center font-medium">N4</th>
              <th scope="col" className="px-2 py-2 text-center font-medium">Média</th>
              <th scope="col" className="px-3 py-2 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {GRADES.map((grade) => (
              <tr key={grade.rm}>
                <td className="px-3 py-2 font-medium text-neutral-800">{grade.name}</td>
                <td className="px-2 py-2 text-center text-neutral-600">
                  {grade.n1.toFixed(1)}
                </td>
                <td className="px-2 py-2 text-center text-neutral-600">
                  {grade.n2.toFixed(1)}
                </td>
                <td className="px-2 py-2 text-center text-neutral-600">
                  {grade.n3.toFixed(1)}
                </td>
                <td className="px-2 py-2 text-center text-neutral-600">
                  {grade.n4.toFixed(1)}
                </td>
                <td
                  className={`px-2 py-2 text-center font-bold ${
                    grade.media >= 6 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {grade.media.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      grade.status === 'Aprovado'
                        ? 'bg-success-soft text-success'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {grade.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex-1 rounded-xl bg-surface p-4 shadow-card">
        <p className="mb-3 text-xs font-semibold text-neutral-700">
          Diário de Classe — Chamada de Hoje
        </p>
        <ul className="space-y-2">
          {ATTENDANCE.map((student) => (
            <li
              key={student.name}
              className="flex items-center justify-between gap-2 rounded-lg bg-surface-muted px-3 py-2"
            >
              <span className="truncate text-xs font-medium text-neutral-800">
                {student.name}
              </span>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  student.present
                    ? 'bg-success-soft text-success'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {student.present ? <UserCheck size={11} /> : <UserX size={11} />}
                {student.present ? 'Presente' : 'Ausente'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
