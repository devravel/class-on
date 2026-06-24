"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeaderTitle } from "@/contexts/page-header-context";
import { Button } from "@/components/ui/button";
import { authApi, gradesApi } from "@/lib/api";
import {
  formatGradeCell,
  getGradeDisplayStatus,
  parseGradeValue,
} from "@/lib/class-utils";
import { getSubjectIcon } from "@/lib/subject-icons";
import { cn } from "@/lib/utils";
import { GradeDisplayStatus, StudentGradeRecord } from "@/types/grade";

const STATUS_LABELS: Record<GradeDisplayStatus, string> = {
  APROVADO: "Aprovado",
  EM_RECUPERACAO: "Em Recuperação",
  REPROVADO: "Reprovado",
};

const STATUS_STYLES: Record<GradeDisplayStatus, string> = {
  APROVADO: "bg-success/10 text-success",
  EM_RECUPERACAO: "bg-warning/10 text-warning",
  REPROVADO: "bg-danger/10 text-danger",
};

interface SubjectGrades {
  subjectName: string;
  bimesters: Map<number, StudentGradeRecord>;
}

function groupGradesBySubject(grades: StudentGradeRecord[]): SubjectGrades[] {
  const subjectMap = new Map<string, SubjectGrades>();

  for (const grade of grades) {
    const subjectName = grade.assignments.subjects.name;
    const existing = subjectMap.get(subjectName);

    if (existing) {
      existing.bimesters.set(grade.bimesters.number, grade);
    } else {
      subjectMap.set(subjectName, {
        subjectName,
        bimesters: new Map([[grade.bimesters.number, grade]]),
      });
    }
  }

  return Array.from(subjectMap.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName, "pt-BR"),
  );
}

function GradeStatusBadge({ status }: { status: GradeDisplayStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AlunoNotasPage() {
  const [grades, setGrades] = useState<StudentGradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoletim = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const me = await authApi.getMe();
      if (!me.student) {
        setError("Perfil de aluno não encontrado.");
        return;
      }

      const gradesData = await gradesApi.getMyGrades();
      setGrades(Array.isArray(gradesData) ? gradesData : []);
    } catch {
      setError("Não foi possível carregar seu boletim. Tente novamente.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadBoletim();
  }, [loadBoletim]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void loadBoletim({ silent: true });
      }
    }

    function handleWindowFocus() {
      void loadBoletim({ silent: true });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [loadBoletim]);

  const subjects = useMemo(() => groupGradesBySubject(grades), [grades]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeaderTitle title="Minhas Notas" />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary">
            Acompanhe suas notas por disciplina e bimestre
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={() => void loadBoletim({ silent: true })}
          className="shrink-0"
        >
          {isRefreshing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Atualizar boletim
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Boletim por disciplina */}
      {subjects.length === 0 && !error ? (
        <div className="rounded-card border border-border bg-neutral-50 p-12 text-center">
          <p className="text-sm font-medium text-text-primary">
            Nenhuma nota lançada
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Suas notas aparecerão aqui assim que os professores as registrarem.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {subjects.map((subject) => {
            const SubjectIcon = getSubjectIcon(subject.subjectName);

            return (
            <div
              key={subject.subjectName}
              className="overflow-hidden rounded-card border border-border bg-background shadow-sm"
            >
              <div className="border-b border-border bg-neutral-50 px-4 py-3 sm:px-6">
                <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                  <SubjectIcon size={16} className="text-primary" />
                  {subject.subjectName}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-neutral-50/50 text-left text-xs uppercase tracking-wide text-text-secondary">
                      <th className="px-4 py-3 font-medium sm:px-6">
                        Bimestre
                      </th>
                      <th className="px-3 py-3 text-center font-medium">N1</th>
                      <th className="px-3 py-3 text-center font-medium">N2</th>
                      <th className="px-3 py-3 text-center font-medium">N3</th>
                      <th className="px-3 py-3 text-center font-medium">N4</th>
                      <th className="px-3 py-3 text-center font-medium">
                        Média
                      </th>
                      <th className="px-3 py-3 text-center font-medium">
                        Rec.
                      </th>
                      <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((bimesterNumber) => {
                      const grade = subject.bimesters.get(bimesterNumber);

                      if (!grade) {
                        return (
                          <tr
                            key={bimesterNumber}
                            className="border-b border-border/60 text-text-secondary"
                          >
                            <td className="px-4 py-3 font-medium sm:px-6">
                              {bimesterNumber}º Bimestre
                            </td>
                            <td className="px-3 py-3 text-center">—</td>
                            <td className="px-3 py-3 text-center">—</td>
                            <td className="px-3 py-3 text-center">—</td>
                            <td className="px-3 py-3 text-center">—</td>
                            <td className="px-3 py-3 text-center">—</td>
                            <td className="px-3 py-3 text-center">—</td>
                            <td className="px-4 py-3 sm:px-6">
                              <span className="text-xs text-text-secondary">
                                Aguardando
                              </span>
                            </td>
                          </tr>
                        );
                      }

                      const average = parseGradeValue(grade.average);
                      const recovery =
                        grade.recovery_grade != null
                          ? parseGradeValue(grade.recovery_grade)
                          : null;
                      const finalAverage =
                        grade.final_average != null
                          ? parseGradeValue(grade.final_average)
                          : null;
                      const displayStatus = getGradeDisplayStatus(
                        average,
                        recovery,
                        finalAverage,
                      );
                      const displayAverage = finalAverage ?? average;

                      return (
                        <tr
                          key={bimesterNumber}
                          className="border-b border-border/60 transition-colors hover:bg-neutral-50/50"
                        >
                          <td className="px-4 py-3 font-medium text-text-primary sm:px-6">
                            {bimesterNumber}º Bimestre
                          </td>
                          <td className="px-3 py-3 text-center">
                            {formatGradeCell(grade.n1)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {formatGradeCell(grade.n2)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {formatGradeCell(grade.n3)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {formatGradeCell(grade.n4)}
                          </td>
                          <td
                            className={cn(
                              "px-3 py-3 text-center font-semibold",
                              displayAverage >= 6
                                ? "text-success"
                                : "text-danger",
                            )}
                          >
                            {displayAverage.toFixed(1)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {formatGradeCell(grade.recovery_grade)}
                          </td>
                          <td className="px-4 py-3 sm:px-6">
                            <GradeStatusBadge status={displayStatus} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
