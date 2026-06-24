"use client";

import {
  AlertCircle,
  ChevronRight,
  Clock,
  ListTodo,
  Loader2,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { InlineError } from "@/components/dashboard/InlineError";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import {
  DASHBOARD_LIST_LIMIT,
  ListCard,
} from "@/components/dashboard/ListCard";
import { Section } from "@/components/dashboard/Section";
import { PageContainer } from "@/components/layout/PageContainer";
import { UpcomingEventsCard } from "@/components/events/UpcomingEventsCard";
import { attendanceApi, authApi, gradesApi } from "@/lib/api";
import { announcementsApi } from "@/lib/api/announcements";
import { tasksApi } from "@/lib/api/tasks";
import { getGradeDisplayStatus, parseGradeValue } from "@/lib/class-utils";
import { getSubjectIcon } from "@/lib/subject-icons";
import { cn } from "@/lib/utils";
import { StudentAttendanceSummary } from "@/types/attendance";
import { StudentGradeRecord } from "@/types/grade";
import { Announcement } from "@/types/announcement";
import { StudentTask } from "@/types/task";

interface RecentGradeItem {
  id: string;
  subject: string;
  grade: number;
  bimester: string;
  status: "approved" | "watch" | "failed";
}

function buildRecentGrades(grades: StudentGradeRecord[]): RecentGradeItem[] {
  const bySubject = new Map<string, StudentGradeRecord>();

  for (const grade of grades) {
    const subjectName = grade.assignments.subjects.name;
    const existing = bySubject.get(subjectName);
    if (!existing || grade.bimesters.number > existing.bimesters.number) {
      bySubject.set(subjectName, grade);
    }
  }

  return Array.from(bySubject.values()).map((grade) => {
    const average = parseGradeValue(grade.average);
    const recovery =
      grade.recovery_grade != null
        ? parseGradeValue(grade.recovery_grade)
        : null;
    const finalAverage =
      grade.final_average != null ? parseGradeValue(grade.final_average) : null;
    const displayAverage = finalAverage ?? average;
    const displayStatus = getGradeDisplayStatus(
      average,
      recovery,
      finalAverage,
    );

    const status: RecentGradeItem["status"] =
      displayStatus === "APROVADO"
        ? "approved"
        : displayStatus === "EM_RECUPERACAO"
          ? "watch"
          : "failed";

    return {
      id: grade.id,
      subject: grade.assignments.subjects.name,
      grade: displayAverage,
      bimester: `${grade.bimesters.number}º Bimestre`,
      status,
    };
  });
}

function getPendingTasks(tasks: StudentTask[]): StudentTask[] {
  return tasks.filter((task) => {
    const submission = task.task_submissions[0];
    if (submission) return false;
    return true;
  });
}

function isTaskOverdue(task: StudentTask): boolean {
  const submission = task.task_submissions[0];
  if (submission) return false;
  return new Date(task.deadline) < new Date();
}

const gradeColor: Record<string, string> = {
  approved: "text-success",
  watch: "text-warning",
  failed: "text-danger",
};

const taskBadge: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  late: "bg-danger/10 text-danger",
};

const taskLabel: Record<string, string> = {
  pending: "Pendente",
  late: "Atrasada",
};

export default function AlunoPage() {
  const [recentGrades, setRecentGrades] = useState<RecentGradeItem[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendanceSummary | null>(
    null,
  );
  const [pendingTasks, setPendingTasks] = useState<StudentTask[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [announcementsError, setAnnouncementsError] = useState<string | null>(
    null,
  );
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true);

  const loadStudentData = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true);
      }
      setGradesError(null);
      setAttendanceError(null);
      setTasksError(null);

      try {
        const me = await authApi.getMe();
        if (!me.student) {
          setGradesError("Perfil de aluno não encontrado.");
          return;
        }

        const gradesPromise = gradesApi
          .getMyGrades()
          .then((data) => {
            const grades = Array.isArray(data) ? data : [];
            setRecentGrades(buildRecentGrades(grades));
          })
          .catch(() => {
            setGradesError("Não foi possível carregar suas notas.");
          });

        const attendancePromise = attendanceApi
          .getStudentSummary(me.student.id)
          .then(setAttendance)
          .catch(() => {
            setAttendanceError("Não foi possível carregar sua frequência.");
          });

        const tasksPromise = tasksApi
          .listMyTasks()
          .then((data) => {
            const tasks = Array.isArray(data) ? data : [];
            setPendingTasks(getPendingTasks(tasks));
          })
          .catch(() => {
            setTasksError("Não foi possível carregar suas tarefas.");
          });

        await Promise.all([gradesPromise, attendancePromise, tasksPromise]);
      } catch {
        setGradesError("Não foi possível carregar seus dados.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loadAnnouncements = useCallback(async () => {
    try {
      setIsAnnouncementsLoading(true);
      setAnnouncementsError(null);
      const data = await announcementsApi.findAll();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setAnnouncementsError("Não foi possível carregar os comunicados.");
    } finally {
      setIsAnnouncementsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudentData();
    void loadAnnouncements();
  }, [loadStudentData, loadAnnouncements]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadStudentData({ silent: true });
      }
    }

    function handleWindowFocus() {
      void loadStudentData({ silent: true });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [loadStudentData]);

  const lateCount = useMemo(
    () => pendingTasks.filter((task) => isTaskOverdue(task)).length,
    [pendingTasks],
  );

  const attendanceRate = attendance?.attendance_rate ?? 0;
  const isAttendanceHealthy = attendanceRate >= 75;

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardPageHeader title="Olá," />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DashboardPageHeader title="Olá," />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section
          title="Notas Recentes"
          action={
            <Link
              href="/aluno/notas"
              className="link-action flex items-center gap-1 text-xs"
            >
              Ver todas <ChevronRight size={14} />
            </Link>
          }
        >
          {gradesError ? (
            <InlineError message={gradesError} />
          ) : (
            <ListCard
              items={recentGrades}
              limit={DASHBOARD_LIST_LIMIT}
              fixedRowArea
              emptyMessage="Nenhuma nota lançada ainda."
              renderItem={(item) => {
                const SubjectIcon = getSubjectIcon(item.subject);

                return (
                  <div className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                        <SubjectIcon size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {item.subject}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {item.bimester}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-lg font-bold ${gradeColor[item.status] ?? "text-text-primary"}`}
                    >
                      {item.grade.toFixed(1)}
                    </span>
                  </div>
                );
              }}
            />
          )}
        </Section>

        <Section
          title="Frequência"
          action={
            <Link
              href="/aluno/frequencia"
              className="link-action flex items-center gap-1 text-xs"
            >
              Ver detalhes <ChevronRight size={14} />
            </Link>
          }
        >
          {attendanceError ? (
            <InlineError message={attendanceError} />
          ) : attendance ? (
            <div className="rounded-card bg-surface p-4 shadow-light ring-1 ring-border">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  Frequência geral
                </span>
                <span
                  className={cn(
                    "text-lg font-bold",
                    isAttendanceHealthy ? "text-success" : "text-danger",
                  )}
                >
                  {attendanceRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isAttendanceHealthy ? "bg-success" : "bg-danger",
                  )}
                  style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                {attendance.present} presenças · {attendance.absent} faltas ·{" "}
                {attendance.total_lessons} aulas
              </p>
            </div>
          ) : (
            <div className="rounded-card bg-surface p-6 text-center shadow-light ring-1 ring-border">
              <p className="text-sm text-text-secondary">
                Nenhuma aula registrada ainda.
              </p>
            </div>
          )}
        </Section>

        <Section
          title="Comunicados"
          action={
            <Link
              href="/aluno/comunicados"
              className="link-action flex items-center gap-1 text-xs"
            >
              Ver todos <ChevronRight size={14} />
            </Link>
          }
        >
          {isAnnouncementsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
                <p className="mt-2 text-xs text-neutral-500">Carregando...</p>
              </div>
            </div>
          ) : announcementsError ? (
            <InlineError message={announcementsError} />
          ) : (
            <ListCard
              items={announcements}
              limit={DASHBOARD_LIST_LIMIT}
              renderItem={(item) => (
                <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-100">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <Megaphone size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-text-primary">
                      {item.title}
                    </p>
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Clock size={10} />
                      {new Date(item.created_at).toLocaleDateString("pt-BR")} ·
                      {item.users.teachers?.[0]?.full_name || item.users.email}
                    </span>
                  </div>
                </div>
              )}
              emptyMessage="Nenhum comunicado recente"
            />
          )}
        </Section>

        <div className="grid grid-cols-1 gap-6 lg:col-span-3 lg:grid-cols-2">
        <Section
          title="Tarefas Pendentes"
          description={
            lateCount > 0
              ? `${lateCount} tarefa${lateCount > 1 ? "s" : ""} atrasada${lateCount > 1 ? "s" : ""}`
              : `${pendingTasks.length} tarefa${pendingTasks.length !== 1 ? "s" : ""} aguardando`
          }
          action={
            <Link
              href="/aluno/tarefas"
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
              items={pendingTasks}
              limit={DASHBOARD_LIST_LIMIT}
              emptyMessage="Nenhuma tarefa pendente."
              renderItem={(item) => {
                const overdue = isTaskOverdue(item);
                const statusKey = overdue ? "late" : "pending";

                return (
                  <div className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-neutral-100">
                    <div className="flex min-w-0 items-start gap-3">
                      {overdue ? (
                        <AlertCircle
                          size={14}
                          className="mt-0.5 shrink-0 text-danger"
                        />
                      ) : (
                        <ListTodo
                          size={14}
                          className="mt-0.5 shrink-0 text-text-secondary"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {item.title}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {item.assignments.subjects.name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${taskBadge[statusKey] ?? ""}`}
                    >
                      {taskLabel[statusKey]}
                    </span>
                  </div>
                );
              }}
            />
          )}
        </Section>

        <UpcomingEventsCard role="ALUNO" limit={4} />
        </div>
      </div>
    </PageContainer>
  );
}
