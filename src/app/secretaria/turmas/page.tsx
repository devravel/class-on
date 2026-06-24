"use client";

import {
  Archive,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DeleteClassDialog } from "@/components/classes/DeleteClassDialog";
import { PermanentDeleteClassDialog } from "@/components/classes/PermanentDeleteClassDialog";
import { ListCard } from "@/components/dashboard/ListCard";
import { Section } from "@/components/dashboard/Section";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeaderTitle } from "@/contexts/page-header-context";
import { PageLoader } from "@/components/ui/page-loader";
import { Button, buttonVariants } from "@/components/ui/button";
import { classesApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Class,
  EDUCATION_LEVEL_LABELS,
  formatClassShortLabel,
  SHIFT_LABELS,
  Shift,
} from "@/types/class";

function matchesSearch(classRecord: Class, search: string): boolean {
  if (!search.trim()) return true;
  const q = search.toLowerCase();
  const seriesLabel = formatClassShortLabel(classRecord).toLowerCase();
  const levelLabel = (
    EDUCATION_LEVEL_LABELS[classRecord.education_level] ?? ""
  ).toLowerCase();
  const shiftLabel = (
    SHIFT_LABELS[classRecord.shift as Shift] ?? ""
  ).toLowerCase();
  const yearLabel = String(classRecord.academic_years?.year ?? "");
  return (
    seriesLabel.includes(q) ||
    levelLabel.includes(q) ||
    classRecord.letter.toLowerCase().includes(q) ||
    shiftLabel.includes(q) ||
    yearLabel.includes(q)
  );
}

function ClassListItem({
  item,
  archived = false,
  onDeleteClick,
  onPermanentDeleteClick,
  onNavigate,
}: {
  item: Class;
  archived?: boolean;
  onDeleteClick?: (classRecord: Class) => void;
  onPermanentDeleteClick?: (classRecord: Class) => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
        archived ? "opacity-75 hover:bg-neutral-50" : "hover:bg-neutral-100",
      )}
    >
      <button
        type="button"
        onClick={() => onNavigate(item.id)}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-component",
            archived ? "bg-neutral-200" : "bg-primary/10",
          )}
        >
          {archived ? (
            <Archive size={18} className="text-text-secondary" />
          ) : (
            <BookOpen size={18} className="text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-base font-semibold",
                archived ? "text-text-secondary" : "text-text-primary",
              )}
            >
              {formatClassShortLabel(item)}
            </p>
            {archived && (
              <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-text-secondary">
                Desativada
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            {EDUCATION_LEVEL_LABELS[item.education_level]}
            {" · "}
            {SHIFT_LABELS[item.shift as Shift] ?? item.shift}
            {" · "}
            {item.academic_years?.year ?? "—"}
          </p>
        </div>
        <ChevronRight
          size={18}
          className="ml-auto hidden shrink-0 text-text-secondary sm:block"
        />
      </button>

      <div className="flex shrink-0 items-center gap-2 sm:pl-4">
        <Link
          href={`/secretaria/turmas/${item.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Ver Detalhes
        </Link>
        {!archived && (
          <>
            <Link
              href={`/secretaria/turmas/${item.id}/editar`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              onClick={(event) => event.stopPropagation()}
            >
              <Pencil size={14} />
              Editar
            </Link>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDeleteClick?.(item)}
            >
              <Trash2 size={14} />
              Desativar
            </Button>
          </>
        )}
        {archived && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onPermanentDeleteClick?.(item)}
          >
            <Trash2 size={14} />
            Excluir
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TurmasPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] =
    useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await classesApi.list({ includeInactive: true });
      setClasses(data);
    } catch (err) {
      console.error("Erro ao carregar turmas:", err);
      setError("Não foi possível carregar as turmas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleDeleteClick = (classRecord: Class) => {
    setSelectedClass(classRecord);
    setIsDeleteDialogOpen(true);
  };

  const handlePermanentDeleteClick = (classRecord: Class) => {
    setSelectedClass(classRecord);
    setIsPermanentDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedClass(null);
  };

  const handlePermanentDeleteClose = () => {
    setIsPermanentDeleteDialogOpen(false);
    setSelectedClass(null);
  };

  const { activeClasses, archivedClasses } = useMemo(() => {
    const filtered = classes.filter((c) => matchesSearch(c, search));
    return {
      activeClasses: filtered.filter((c) => c.is_active !== false),
      archivedClasses: filtered.filter((c) => c.is_active === false),
    };
  }, [classes, search]);

  return (
    <PageContainer>
      <PageHeaderTitle title="Turmas" />

      {isLoading && <PageLoader />}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Buscar por série, letra, turno ou ano..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm rounded-component border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 transition-all"
              />
              <Link
                href="/secretaria/turmas/nova"
                className={cn(buttonVariants(), "shrink-0")}
              >
                <Plus size={16} />
                Nova Turma
              </Link>
            </div>

            <ListCard
              items={activeClasses}
              emptyMessage={
                search
                  ? "Nenhuma turma ativa encontrada para esta busca."
                  : "Nenhuma turma ativa cadastrada."
              }
              renderItem={(item) => (
                <ClassListItem
                  item={item}
                  onDeleteClick={handleDeleteClick}
                  onNavigate={(id) => router.push(`/secretaria/turmas/${id}`)}
                />
              )}
            />
          </div>

          {archivedClasses.length > 0 && (
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowArchived((prev) => !prev)}
                className="mb-4 flex w-full items-center gap-2 rounded-component border border-border bg-muted/30 px-4 py-3 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-muted/50"
              >
                {showArchived ? (
                  <ChevronDown size={16} className="shrink-0" />
                ) : (
                  <ChevronRight size={16} className="shrink-0" />
                )}
                <Archive size={16} className="shrink-0" />
                Turmas desativadas ({archivedClasses.length})
              </button>

              {showArchived && (
                <Section
                  title="Turmas Desativadas"
                  description="Turmas arquivadas. É possível excluí-las permanentemente do sistema."
                >
                  <ListCard
                    items={archivedClasses}
                    emptyMessage="Nenhuma turma desativada."
                    renderItem={(item) => (
                      <ClassListItem
                        item={item}
                        archived
                        onPermanentDeleteClick={handlePermanentDeleteClick}
                        onNavigate={(id) =>
                          router.push(`/secretaria/turmas/${id}`)
                        }
                      />
                    )}
                  />
                </Section>
              )}
            </div>
          )}
        </>
      )}

      <DeleteClassDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteClose}
        classRecord={selectedClass}
        onDeleted={loadClasses}
      />

      <PermanentDeleteClassDialog
        open={isPermanentDeleteDialogOpen}
        onClose={handlePermanentDeleteClose}
        classRecord={selectedClass}
        onDeleted={loadClasses}
      />
    </PageContainer>
  );
}
