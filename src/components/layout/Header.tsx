"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LogOut, Menu } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";

const ROLE_LABEL: Record<string, string> = {
  SECRETARIA: "Secretaria",
  PROFESSOR: "Professor",
  ALUNO: "Aluno",
};

export function Header() {
  const { user, signOut } = useAuth();
  const { isCollapsed, toggleCollapsed, toggleMobile } = useSidebar();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? "U";
  const roleLabel = user?.role ? (ROLE_LABEL[user.role] ?? "") : "";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 shadow-light">
      {/* Left: toggle controls */}
      <div className="flex items-center gap-1">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobile}
          className="flex items-center justify-center rounded-component p-2 text-text-secondary transition-colors hover:bg-neutral-200 hover:text-text-primary lg:hidden cursor-pointer"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="hidden items-center justify-center rounded-component p-2 text-text-secondary transition-colors hover:bg-neutral-200 hover:text-text-primary lg:flex"
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Right: user area */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium leading-none text-text-primary">
              {user.email}
            </span>
            <span className="mt-0.5 text-xs text-text-secondary">
              {roleLabel}
            </span>
          </div>
        )}

        <div className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          {initials}
        </div>

        <button
          onClick={handleSignOut}
          title="Sair"
          className="flex items-center gap-1.5 rounded-component px-2.5 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-neutral-200 hover:text-text-primary cursor-pointer"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
