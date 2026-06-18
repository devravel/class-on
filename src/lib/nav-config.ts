import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BookMarked,
  BookUser,
  Megaphone,
  ListTodo,
  BarChart2,
  School,
  Calendar,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const secretariaNav: NavItem[] = [
  { label: 'Dashboard', href: '/secretaria', icon: LayoutDashboard },
  { label: 'Turmas', href: '/secretaria/turmas', icon: BookOpen },
  { label: 'Alunos', href: '/secretaria/alunos', icon: Users },
  { label: 'Professores', href: '/secretaria/professores', icon: GraduationCap },
  { label: 'Disciplinas', href: '/secretaria/disciplinas', icon: BookMarked },
  { label: 'Atribuições', href: '/secretaria/atribuicoes', icon: BookUser },
  { label: 'Anos Letivos', href: '/secretaria/academic-years', icon: School },
  { label: 'Comunicados', href: '/secretaria/comunicados', icon: Megaphone },
  { label: 'Agendão', href: '/secretaria/calendario', icon: Calendar },
]

export const professorNav: NavItem[] = [
  { label: 'Início', href: '/professor', icon: LayoutDashboard },
  { label: 'Minhas Turmas', href: '/professor/turmas', icon: BookOpen },
  // Notas, chamada e tarefas unificados em /professor/turmas/[id] (sprint demo)
  { label: 'Comunicados', href: '/professor/comunicados', icon: Megaphone },
  { label: 'Agendão', href: '/professor/calendario', icon: Calendar },
]

export const alunoNav: NavItem[] = [
  { label: 'Início', href: '/aluno', icon: LayoutDashboard },
  { label: 'Minhas Notas', href: '/aluno/notas', icon: BarChart2 },
  // Frequência integrada ao boletim em /aluno/notas (sprint demo)
  { label: 'Tarefas', href: '/aluno/tarefas', icon: ListTodo },
  { label: 'Comunicados', href: '/aluno/comunicados', icon: Megaphone },
  { label: 'Agendão', href: '/aluno/calendario', icon: Calendar },
]
