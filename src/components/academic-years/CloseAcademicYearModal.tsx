"use client";

import {
  AlertTriangle,
  LockKeyhole,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AcademicYear } from "@/types/academic-year";
import { academicYearsApi } from "@/lib/api";

interface CloseAcademicYearModalProps {
  open: boolean;
  onClose: () => void;
  academicYear: AcademicYear | null;
  onYearClosed?: () => void;
}

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
              disabled={isClosing}
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
