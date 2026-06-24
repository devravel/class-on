"use client";

import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  ListTodo,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { InlineError } from "@/components/dashboard/InlineError";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import {
  DASHBOARD_LIST_LIMIT,
  DASHBOARD_LIST_ROW_HEIGHT,
  ListCard,
} from "@/components/dashboard/ListCard";
import { Section } from "@/components/dashboard/Section";
import { PageContainer } from "@/components/layout/PageContainer";
import { UpcomingEventsCard } from "@/components/events/UpcomingEventsCard";
import { ProfessorStudentDetailDialog } from "@/components/students/ProfessorStudentDetailDialog";
import { TaskDetailDialog } from "@/components/tasks/TaskDetailDialog";
import { Input } from "@/components/ui/input";
import { assignmentsApi, authApi, classesApi } from "@/lib/api";
import { tasksApi } from "@/lib/api/tasks";
import { getClassLabel, getClassLabelLoose } from "@/lib/class-utils";
import { Assignment } from "@/types/assignment";
import { Task } from "@/types/task";

interface TeacherStudentRow {
  id: string;
  full_name: string;
  rm: string;
  classLabel: string;
  classId: string;
  assignmentId: string;
}

const STUDENT_SEARCH_VISIBLE_ROWS = 3;
const STUDENT_SEARCH_LIST_HEIGHT =
  STUDENT_SEARCH_VISIBLE_ROWS * DASHBOARD_LIST_ROW_HEIGHT;

export default function ProfessorPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<TeacherStudentRow | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setAssignmentsError(null);
      setTasksError(null);

      try {
        const me = await authApi.getMe();
        if (!me.teacher) {
          setAssignmentsError("Perfil de professor não encontrado.");
          return;
        }

        let assignmentsData: Assignment[] = [];
        try {
          assignmentsData = await assignmentsApi.getByTeacher(me.teacher.id);
          setAssignments(assignmentsData);
        } catch {
          setAssignmentsError("Não foi possível carregar suas turmas.");
        }

        try {
          const tasksData = await tasksApi.list();
          const sorted = (Array.isArray(tasksData) ? tasksData : []).sort(
            (a, b) =>
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
          );
          setTasks(sorted);
        } catch {
          setTasksError("Não foi possível carregar suas tarefas.");
        }

        const assignmentByClassId = new Map<string, Assignment>();
        for (const assignment of assignmentsData) {
          assignmentByClassId.set(assignment.class_id, assignment);
        }

        const uniqueClassIds = [
          ...new Set(assignmentsData.map((a) => a.class_id)),
        ];
        const studentMap = new Map<string, TeacherStudentRow>();

        await Promise.all(
          uniqueClassIds.map(async (classId) => {
            const assignment = assignmentByClassId.get(classId);
            if (!assignment) return;

            try {
              const details = await classesApi.getDetails(classId);
              for (const enrollment of details.enrollments) {
                const student = enrollment.students;
                if (!studentMap.has(student.id)) {
                  studentMap.set(student.id, {
                    id: student.id,
                    full_name: student.full_name,
                    rm: student.rm,
                    classLabel: getClassLabel(details),
                    classId,
                    assignmentId: assignment.id,
                  });
                }
              }
            } catch {
              // ignore per-class failures
            }
          }),
        );

        setStudents(
          [...studentMap.values()].sort((a, b) =>
            a.full_name.localeCompare(b.full_name, "pt-BR"),
          ),
        );

        if (assignmentsData[0]) {
          setSubjectName(assignmentsData[0].subjects.name);
        }
      } catch {
        setAssignmentsError("Não foi possível carregar seus dados.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (student) =>
        student.full_name.toLowerCase().includes(q) ||
        student.rm.toLowerCase().includes(q) ||
        student.classLabel.toLowerCase().includes(q),
    );
  }, [students, studentSearch]);

  const selectedAssignmentForStudent = useMemo(() => {
    if (!selectedStudent) return null;
    return (
      assignments.find((a) => a.id === selectedStudent.assignmentId) ?? null
    );
  }, [selectedStudent, assignments]);

  return (
    <PageContainer className="flex h-full flex-col overflow-hidden pt-6! pb-6! lg:pt-8! lg:pb-8! [--spacing-dashboard-header:40px] [&_.mb-dashboard-header]:gap-2 lg:[&_.mb-dashboard-header]:gap-4">
      <DashboardPageHeader title="Olá," />

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {assignmentsError && !isLoading && (
        <InlineError message={assignmentsError} className="mb-6" />
      )}

      {!isLoading && !assignmentsError && (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="grid shrink-0 grid-cols-1 gap-3 lg:grid-cols-3">
            <div>
              <Section
                title="Minhas Turmas"
                className="gap-3"
                action={
                  <Link
                    href="/professor/turmas"
                    className="link-action flex items-center gap-1 text-xs"
                  >
                    Ver todas <ChevronRight size={14} />
                  </Link>
                }
              >
                <ListCard
                  items={assignments}
                  limit={DASHBOARD_LIST_LIMIT}
                  emptyMessage="Nenhuma turma atribuída. Entre em contato com a secretaria."
                  renderItem={(item) => (
                    <Link
                      href={`/professor/turmas/${item.id}`}
                      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                          <BookOpen size={14} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {getClassLabel(item.classes)}
                          </p>
                          <p className="truncate text-xs text-text-secondary">
                            {item.subjects.name}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-text-secondary"
                      />
                    </Link>
                  )}
                />
              </Section>
            </div>

            <div>
              <UpcomingEventsCard
                role="PROFESSOR"
                limit={DASHBOARD_LIST_LIMIT}
              />
            </div>

            <div>
              <Section
                title="Tarefas Criadas"
                className="gap-3"
                action={
                  <Link
                    href="/professor/tarefas"
                    className="link-action flex items-center gap-1 text-xs"
                  >
                    Ver todas <ChevronRight size={14} />
                  </Link>
                }
              >
                {tasksError ? (
                  <InlineError message={tasksError} />
                ) : (
                  <ListCard
                    items={tasks}
                    limit={DASHBOARD_LIST_LIMIT}
                    emptyMessage="Nenhuma tarefa criada ainda."
                    renderItem={(item) => (
                      <button
                        type="button"
                        onClick={() => setSelectedTaskId(item.id)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-neutral-100"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                            <ListTodo size={14} className="text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text-primary">
                              {item.title}
                            </p>
                            <p className="text-xs text-text-secondary">
                              Prazo:{" "}
                              {new Date(item.deadline).toLocaleDateString(
                                "pt-BR",
                              )}
                              {item.assignments?.classes && (
                                <>
                                  {" · "}
                                  {getClassLabelLoose(item.assignments.classes)}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    )}
                  />
                )}
              </Section>
            </div>
          </div>

          <Section title="Buscar Alunos" className="shrink-0">
            <div className="overflow-hidden rounded-card bg-surface shadow-light ring-1 ring-border">
              <div className="border-b border-border px-4 py-3">
                <div className="relative max-w-md">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <Input
                    type="search"
                    placeholder="Buscar por nome, RM ou turma..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="rounded-full pl-9"
                  />
                </div>
              </div>

              <ul
                className="divide-y divide-border overflow-y-auto"
                style={{ height: STUDENT_SEARCH_LIST_HEIGHT }}
              >
                {filteredStudents.length === 0 ? (
                  <li className="flex h-full items-center justify-center px-4 text-center text-sm text-text-secondary">
                    Nenhum aluno encontrado.
                  </li>
                ) : (
                  filteredStudents.map((student) => (
                    <li key={student.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-neutral-100"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                            <GraduationCap
                              size={14}
                              className="text-primary"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text-primary">
                              {student.full_name}
                            </p>
                            <p className="truncate text-xs text-text-secondary">
                              {student.classLabel} · RM: {student.rm}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className="shrink-0 text-text-secondary"
                        />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Section>
        </div>
      )}

      <ProfessorStudentDetailDialog
        open={selectedStudent != null}
        onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}
        studentId={selectedStudent?.id ?? null}
        assignmentId={selectedStudent?.assignmentId ?? null}
        classId={selectedStudent?.classId ?? null}
        subjectName={selectedAssignmentForStudent?.subjects.name ?? subjectName}
      />

      <TaskDetailDialog
        taskId={selectedTaskId}
        open={selectedTaskId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
        onUpdated={async () => {
          try {
            const tasksData = await tasksApi.list();
            const sorted = (Array.isArray(tasksData) ? tasksData : []).sort(
              (a, b) =>
                new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
            );
            setTasks(sorted);
          } catch {
            // ignore refresh errors
          }
        }}
        onDeleted={async () => {
          setSelectedTaskId(null);
          try {
            const tasksData = await tasksApi.list();
            const sorted = (Array.isArray(tasksData) ? tasksData : []).sort(
              (a, b) =>
                new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
            );
            setTasks(sorted);
          } catch {
            // ignore refresh errors
          }
        }}
      />
    </PageContainer>
  );
}
