import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BookMarked,
  Megaphone,
  ListTodo,
  BarChart2,
  UserCheck,
  School,
  Calendar,
  Activity,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Rótulo da seção na sidebar. Itens sem grupo caem no primeiro bloco. */
  group?: string;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export const secretariaNav: NavItem[] = [
  { label: "Dashboard", href: "/secretaria", icon: LayoutDashboard, group: "Geral" },
  { label: "Monitoramento", href: "/monitoramento", icon: Activity, group: "Geral" },
  { label: "Turmas", href: "/secretaria/turmas", icon: BookOpen, group: "Acadêmico" },
  { label: "Disciplinas", href: "/secretaria/disciplinas", icon: BookMarked, group: "Acadêmico" },
  { label: "Anos Letivos", href: "/secretaria/academic-years", icon: School, group: "Acadêmico" },
  { label: "Alunos", href: "/secretaria/alunos", icon: Users, group: "Pessoas" },
  {
    label: "Professores",
    href: "/secretaria/professores",
    icon: GraduationCap,
    group: "Pessoas",
  },
  { label: "Comunicados", href: "/secretaria/comunicados", icon: Megaphone, group: "Comunicação" },
  { label: "Agendão", href: "/secretaria/calendario", icon: Calendar, group: "Comunicação" },
];

export const professorNav: NavItem[] = [
  { label: "Início", href: "/professor", icon: LayoutDashboard, group: "Geral" },
  { label: "Minhas Turmas", href: "/professor/turmas", icon: BookOpen, group: "Ensino" },
  { label: "Tarefas", href: "/professor/tarefas", icon: ListTodo, group: "Ensino" },
  // Notas, chamada e tarefas unificados em /professor/turmas/[id] (sprint demo)
  { label: "Conversas", href: "/professor/conversas", icon: MessagesSquare, group: "Comunicação" },
  { label: "Comunicados", href: "/professor/comunicados", icon: Megaphone, group: "Comunicação" },
  { label: "Agendão", href: "/professor/calendario", icon: Calendar, group: "Comunicação" },
];

export const alunoNav: NavItem[] = [
  { label: "Início", href: "/aluno", icon: LayoutDashboard, group: "Geral" },
  { label: "Notas", href: "/aluno/notas", icon: BarChart2, group: "Desempenho" },
  { label: "Frequência", href: "/aluno/frequencia", icon: UserCheck, group: "Desempenho" },
  { label: "Tarefas", href: "/aluno/tarefas", icon: ListTodo, group: "Desempenho" },
  { label: "Conversas", href: "/aluno/conversas", icon: MessagesSquare, group: "Comunicação" },
  { label: "Comunicados", href: "/aluno/comunicados", icon: Megaphone, group: "Comunicação" },
  { label: "Agendão", href: "/aluno/calendario", icon: Calendar, group: "Comunicação" },
];

/** Agrupa preservando a ordem de declaração — sem reordenar nada. */
export function groupNavItems(items: NavItem[]): NavGroup[] {
  const groups: NavGroup[] = [];

  for (const item of items) {
    const label = item.group ?? null;
    const last = groups[groups.length - 1];

    if (last && last.label === label) {
      last.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }

  return groups;
}
