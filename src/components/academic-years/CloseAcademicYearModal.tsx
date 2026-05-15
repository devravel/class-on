"use client";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LockKeyhole,
  School,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AcademicYear } from "@/types/academic-year";
import { academicYearsApi } from "@/lib/api";

interface YearSummaryItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface ValidationItem {
  id: string;
  label: string;
  completed: boolean;
}

interface CloseAcademicYearModalProps {
  open: boolean;
  onClose: () => void;
  academicYear: AcademicYear | null;
  onYearClosed?: () => void;
}

// Mock data - será substituído pela integração real
const getYearSummary = (year: number): YearSummaryItem[] => [
  { label: "Ano letivo ativo", value: year.toString(), icon: School },
  { label: "Turmas vinculadas", value: "28", icon: BookOpen },
  { label: "Alunos matriculados", value: "1.247", icon: Users },
  { label: "Professores ativos", value: "42", icon: GraduationCap },
];

const validationItems: ValidationItem[] = [
  { id: "bimestres", label: "Todos os bimestres fechados", completed: true },
  { id: "notas", label: "Notas finalizadas", completed: true },
  { id: "resultados", label: "Resultados finais definidos", completed: true },
  { id: "pendencias", label: "Nenhuma pendência acadêmica", completed: false },
];

const focusableSelector =
  'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

export function CloseAcademicYearModal({
  open,
  onClose,
  academicYear,
  onYearClosed,
}: CloseAcademicYearModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const frame = requestAnimationFrame(() => {
      if (!dialog) {
        return;
      }
      const focusables = getFocusableElements(dialog);
      focusables[0]?.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) {
        return;
      }

      const focusables = getFocusableElements(dialog);
      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!dialog.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !academicYear) {
    return null;
  }

  const hasPendingValidation = validationItems.some((item) => !item.completed);
  const yearSummary = getYearSummary(academicYear.year);

  const handleCloseYear = async () => {
    if (!academicYear) return;

    try {
      setIsClosing(true);
      setError(null);
      await academicYearsApi.close(academicYear.id);
      onYearClosed?.();
      onClose();
    } catch (err) {
      console.error("Erro ao fechar ano letivo:", err);
      setError("Não foi possível encerrar o ano letivo. Tente novamente.");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-neutral-950/70 p-4 backdrop-blur-sm transition-opacity sm:items-center sm:p-6 md:p-8"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-academic-year-title"
        aria-describedby="close-academic-year-description close-academic-year-warning-text"
        className={cn(
          "flex min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-modal bg-surface shadow-medium ring-1 ring-border",
          // Altura máxima alinhada ao padding vertical do overlay (p-4 → sm:p-6 → md:p-8)
          "max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-4rem)]",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <header className="shrink-0 border-b border-border bg-muted/50 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-component bg-danger/10">
                <LockKeyhole size={22} className="text-danger" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-danger">
                  Ação crítica do sistema
                </p>
                <h2
                  id="close-academic-year-title"
                  className="text-xl font-bold text-text-primary sm:text-2xl"
                >
                  Encerrar Ano Letivo
                </h2>
                <p
                  id="close-academic-year-description"
                  className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary"
                >
                  Revise as informações finais antes de fechar o ano letivo {academicYear.year}.
                  Esta ação alterará o status para FECHADO e preservará o histórico acadêmico.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Fechar modal"
              className="shrink-0 self-start sm:self-auto"
            >
              <XCircle size={18} aria-hidden />
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-8 lg:gap-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-8">
              <section aria-labelledby="close-academic-year-summary-heading">
                <div className="mb-4">
                  <h3
                    id="close-academic-year-summary-heading"
                    className="text-base font-semibold text-text-primary"
                  >
                    Resumo geral
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Dados consolidados do ano letivo que será encerrado.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {yearSummary.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-card bg-background p-4 ring-1 ring-border transition-colors sm:p-5"
                      >
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-component bg-primary/10 sm:mb-4">
                          <Icon
                            size={18}
                            className="text-primary"
                            aria-hidden
                          />
                        </div>
                        <p className="text-sm text-text-secondary">
                          {item.label}
                        </p>
                        <p className="mt-1 text-xl font-bold text-text-primary sm:text-2xl">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section aria-labelledby="close-academic-year-checklist-heading">
                <div className="mb-4">
                  <h3
                    id="close-academic-year-checklist-heading"
                    className="text-base font-semibold text-text-primary"
                  >
                    Checklist de validações
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    O encerramento só fica disponível com todas as etapas
                    concluídas.
                  </p>
                </div>

                <div className="overflow-hidden rounded-card ring-1 ring-border">
                  <ul className="divide-y divide-border">
                    {validationItems.map((item) => (
                      <li key={item.id}>
                        <div className="flex items-center justify-between gap-4 bg-surface px-4 py-3.5 sm:px-4 sm:py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                item.completed
                                  ? "bg-success/10 text-success"
                                  : "bg-warning/10 text-warning",
                              )}
                              aria-hidden
                            >
                              {item.completed ? (
                                <CheckCircle2 size={17} />
                              ) : (
                                <AlertTriangle size={17} />
                              )}
                            </span>
                            <span className="text-sm font-medium leading-snug text-text-primary">
                              {item.label}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                              item.completed
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning",
                            )}
                          >
                            <span className="sr-only">
                              Status da validação:{" "}
                            </span>
                            {item.completed ? "Concluído" : "Pendente"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            <div
              className="rounded-card bg-danger/10 p-4 ring-1 ring-danger/20 sm:p-5"
              role="region"
              aria-labelledby="close-academic-year-warning-title"
            >
              <div className="flex gap-3">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-danger"
                  aria-hidden
                />
                <div className="min-w-0">
                  <h3
                    id="close-academic-year-warning-title"
                    className="text-sm font-semibold text-text-primary"
                  >
                    Atenção antes de confirmar
                  </h3>
                  <p
                    id="close-academic-year-warning-text"
                    className="mt-1 text-sm leading-relaxed text-text-secondary"
                  >
                    Após o fechamento, o ano letivo {academicYear.year} ficará com status FECHADO.
                    Turmas, notas, frequências, tarefas, bimestres e comunicados passam a compor
                    o histórico acadêmico preservado.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-card bg-destructive/10 p-4 text-sm text-destructive ring-1 ring-destructive/20">
                {error}
              </div>
            )}
          </div>
        </div>

        <footer className="shrink-0 border-t border-border bg-muted/40 px-6 py-4 sm:flex sm:justify-end sm:px-8 sm:py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onClose}
              disabled={isClosing}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              disabled={hasPendingValidation || isClosing}
              aria-describedby={
                hasPendingValidation
                  ? "close-academic-year-checklist-heading"
                  : undefined
              }
              onClick={handleCloseYear}
            >
              {isClosing ? "Encerrando..." : "Confirmar Fechamento"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
