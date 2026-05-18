"use client";

import { School, CheckCircle, LockKeyhole, Plus, XCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { CloseAcademicYearModal } from "@/components/academic-years/CloseAcademicYearModal";
import { ListCard } from "@/components/dashboard/ListCard";
import { Section } from "@/components/dashboard/Section";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AcademicYear,
  ACADEMIC_YEAR_STATUS_LABELS,
} from "@/types/academic-year";
import { academicYearsApi } from "@/lib/api";

const statusConfig = {
  ACTIVE: {
    label: ACADEMIC_YEAR_STATUS_LABELS.ACTIVE,
    className: "border border-success/20 bg-success/10 text-success",
    icon: CheckCircle,
  },
  CLOSED: {
    label: ACADEMIC_YEAR_STATUS_LABELS.CLOSED,
    className: "border border-border bg-muted text-text-secondary",
    icon: XCircle,
  },
};

export default function AcademicYearsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCloseYearModalOpen, setIsCloseYearModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);

  const loadAcademicYears = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await academicYearsApi.list();
      setAcademicYears(data);
    } catch (err) {
      console.error("Erro ao carregar anos letivos:", err);
      setError("Não foi possível carregar os anos letivos.");
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega anos letivos da API
  useEffect(() => {
    loadAcademicYears();
  }, []);

  const handleCloseYear = (year: AcademicYear) => {
    setSelectedYear(year);
    setIsCloseYearModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCloseYearModalOpen(false);
    setSelectedYear(null);
  };

  const handleYearClosed = () => {
    loadAcademicYears();
  };

  return (
    <PageContainer>
      {/* Page heading */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Anos Letivos</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gerencie os ciclos acadêmicos institucionais
          </p>
        </div>

        <Link
          href="/secretaria/academic-years/novo"
          className={cn(buttonVariants())}
        >
          <Plus size={16} />
          Novo ano letivo
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Lista de anos letivos */}
      {!isLoading && !error && (
        <Section
          title="Anos Letivos Cadastrados"
          description="Lista de todos os anos letivos cadastrados no sistema"
        >
          <ListCard
            items={academicYears}
            emptyMessage="Nenhum ano letivo encontrado."
            renderItem={(item) => {
            const config = statusConfig[item.status];
            const StatusIcon = config.icon;

            return (
              <div className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-neutral-100 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-component bg-primary/10">
                    <School size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-text-primary">
                      Ano Letivo {item.year}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end sm:pl-4">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${config.className}`}
                  >
                    <StatusIcon size={14} />
                    {config.label}
                  </div>
                  {item.status === "ACTIVE" && (
                    <Button
                      type="button"
                      className="cursor-pointer"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCloseYear(item)}
                    >
                      <LockKeyhole size={14} />
                      Encerrar ano
                    </Button>
                  )}
                </div>
              </div>
            );
          }}
        />
        </Section>
      )}

      <CloseAcademicYearModal
        open={isCloseYearModalOpen}
        onClose={handleCloseModal}
        academicYear={selectedYear}
        onYearClosed={handleYearClosed}
      />
    </PageContainer>
  );
}
