"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { usePageHeader } from "@/contexts/page-header-context";
import {
  UserProfileContainer,
  useUserProfile,
} from "@/components/layout/UserProfileContainer";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const DASHBOARD_PATHS = new Set(["/aluno", "/professor", "/secretaria"]);

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function AppPageHeader() {
  const pathname = usePathname();
  const { title } = usePageHeader();
  const profile = useUserProfile();
  const [commandShortcut, setCommandShortcut] = useState("Ctrl+K");
  // Saudação depende do relógio do cliente — só resolve depois da hidratação
  // pra não divergir do HTML do servidor.
  const [hello, setHello] = useState("Olá");
  const isDashboard = DASHBOARD_PATHS.has(pathname);

  useEffect(() => {
    const isMac =
      typeof navigator !== "undefined" &&
      (/Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
        navigator.userAgent.includes("Mac"));
    setCommandShortcut(isMac ? "⌘K" : "Ctrl+K");
    setHello(greeting());
  }, []);

  function openCommandPalette() {
    window.dispatchEvent(new Event("classon:open-command-palette"));
  }

  const searchPill = (
    <button
      type="button"
      onClick={openCommandPalette}
      // O nome acessível precisa conter o texto visível (WCAG 2.5.3), senão
      // comando de voz "clicar em buscar ou navegar" não encontra o botão.
      aria-label="Buscar ou navegar — ações rápidas"
      aria-keyshortcuts="Control+K Meta+K"
      className="nav-search-trigger group flex h-10 w-full min-w-0 items-center gap-3 rounded-full px-4 text-sm font-medium"
    >
      <Search size={18} aria-hidden="true" className="nav-search-trigger-icon shrink-0" />
      <span className="flex-1 truncate text-left">Buscar ou navegar…</span>
      <kbd className="hidden shrink-0 rounded-md bg-neutral-200 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-text-secondary sm:inline">
        {commandShortcut}
      </kbd>
    </button>
  );

  const topBar = (
    <header className="mb-6 flex items-center gap-3 lg:gap-4">
      <div className="w-full min-w-0 max-w-md">{searchPill}</div>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        <ThemeToggle className="hidden sm:inline-flex" />
        <UserProfileContainer compact />
      </div>
    </header>
  );

  if (isDashboard) {
    return (
      <div className="mb-dashboard-header">
        {topBar}

        {/* Banner escuro de boas-vindas — âncora visual do dashboard */}
        <div className="banner-ink flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="min-w-0">
            {/* h1 da página: sem isso o dashboard não tem título de nível 1 e
                a navegação por cabeçalho do leitor de tela começa no h2. */}
            <h1 className="truncate text-xl font-bold tracking-[-0.015em]">
              {hello}
              {profile?.firstName ? `, ${profile.firstName}` : ""}
            </h1>
            <p className="mt-1 truncate text-sm text-white/55">
              {profile?.roleLabel
                ? `${profile.roleLabel} · ClassOn`
                : "ClassOn"}
            </p>
          </div>
          {title ? (
            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/75">
              {title}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-page-header">
      {topBar}
      {title ? (
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-text-primary">
          {title}
        </h1>
      ) : null}
    </div>
  );
}
