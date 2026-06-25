"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { usePageHeader } from "@/contexts/page-header-context";
import { UserProfileContainer } from "@/components/layout/UserProfileContainer";

const DASHBOARD_PATHS = new Set(["/aluno", "/professor", "/secretaria"]);

export function AppPageHeader() {
  const pathname = usePathname();
  const { title } = usePageHeader();
  const [commandShortcut, setCommandShortcut] = useState("Ctrl+K");
  const isDashboard = DASHBOARD_PATHS.has(pathname);

  useEffect(() => {
    const isMac =
      typeof navigator !== "undefined" &&
      (/Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
        navigator.userAgent.includes("Mac"));
    setCommandShortcut(isMac ? "⌘K" : "Ctrl+K");
  }, []);

  function openCommandPalette() {
    window.dispatchEvent(new Event("classon:open-command-palette"));
  }

  const quickActionsButton = (
    <button
      type="button"
      onClick={openCommandPalette}
      aria-label="Pesquisa: Ações rápidas"
      className="nav-search-trigger group flex w-full min-w-0 items-center gap-3 rounded-component border border-border bg-neutral-200 px-3 py-2 text-sm font-medium"
    >
      <Search
        size={20}
        className="nav-search-trigger-icon shrink-0"
      />
      <span className="flex-1 whitespace-nowrap text-left">Ações rápidas</span>
      <kbd className="hidden shrink-0 rounded border border-border bg-surface px-1 py-0.5 font-mono text-[10px] text-text-secondary sm:inline">
        {commandShortcut}
      </kbd>
    </button>
  );

  if (isDashboard) {
    return (
      <div className="mb-dashboard-header">
        <div className="flex min-w-0 items-center gap-3 lg:gap-4">
          {title ? (
            <h1 className="shrink-0 text-2xl font-bold text-text-primary">
              {title}
            </h1>
          ) : null}
          <UserProfileContainer className="min-w-0 md:max-w-xs" />
          <div className="ml-auto w-full min-w-50 max-w-sm shrink-0">
            {quickActionsButton}
          </div>
        </div>
      </div>
    );
  }

  if (!title) return null;

  return (
    <div className="mb-page-header">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
    </div>
  );
}
