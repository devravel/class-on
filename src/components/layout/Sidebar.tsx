"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { groupNavItems, type NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

interface SidebarProps {
  navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const {
    isCollapsed,
    isMobileOpen,
    closeMobile,
    toggleMobile,
    toggleCollapsed,
  } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  // No mobile o rail é gaveta: sempre abre expandido, colapsado não faz sentido.
  const showExpanded = isMobileOpen || !isCollapsed || isHovered;
  const groups = groupNavItems(navItems);

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  /** Item de nav e botões do rodapé compartilham a mesma caixa. */
  const railButtonBase = cn(
    "group flex items-center rounded-component text-sm font-medium transition-all duration-200",
    showExpanded ? "w-full gap-3 px-3 py-2" : "w-full justify-center px-0 py-2",
  );

  const railButtonClass = (active = false) =>
    cn(
      railButtonBase,
      // sidebar-primary, não primary: o trilho é escuro nos dois temas e o
      // --primary clareia no escuro, derrubando o contraste do texto branco.
      active
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-brand"
        : "nav-item-dark",
    );

  return (
    <>
      {/* Gatilho mobile — aparece quando o rail está fechado */}
      {!isMobileOpen && (
        <button
          type="button"
          onClick={toggleMobile}
          className="rail-dark fixed left-3 top-3 z-50 flex items-center justify-center rounded-full p-2.5 text-white lg:hidden"
          aria-label="Abrir menu de navegação"
          aria-expanded={isMobileOpen}
          aria-controls="rail-navegacao"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      )}

      {/* Backdrop mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/55 backdrop-blur-[2px] lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        id="rail-navegacao"
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "rail-dark fixed inset-y-0 left-0 z-40 m-3 flex flex-col overflow-hidden rounded-rail",
          "transition-[width,transform] duration-300 ease-in-out",
          "lg:static lg:z-auto lg:m-4 lg:mr-0 lg:h-auto lg:translate-x-0",
          // Precisa vencer a própria largura + a margem, senão o rail colapsado
          // vaza uns pixels na borda esquerda quando fechado.
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-[calc(100%+1.5rem)] lg:translate-x-0",
          showExpanded ? "w-[248px]" : "w-[84px]",
        )}
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center justify-center px-4 pb-4 pt-5">
          {showExpanded ? (
            <Logo size={30} tone="mono" className="text-white" />
          ) : (
            <Logo variant="mark" size={28} tone="mono" />
          )}

          {/* Fechar (só mobile) */}
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Fechar menu de navegação"
            className="nav-item-dark ml-auto rounded-full p-1.5 lg:hidden"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navegação agrupada */}
        <nav
          aria-label="Navegação principal"
          className={cn(
            // rail-scroll: em tela baixa a nav rola, mas com barra na cor do
            // trilho — a barra clara do sistema denuncia na hora.
            "rail-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-3",
            showExpanded ? "px-3" : "px-4",
          )}
        >
          {groups.map((group, index) => (
            // Lista de verdade: o leitor de tela anuncia "grupo X, 3 itens".
            // Colapsado o rótulo some da tela mas continua em aria-label.
            <ul
              key={group.label ?? `grupo-${index}`}
              aria-label={group.label ?? undefined}
              className="flex list-none flex-col gap-1"
            >
              {group.label &&
                (showExpanded ? (
                  <li
                    aria-hidden="true"
                    className="px-3 text-[10px] font-semibold uppercase leading-5 tracking-[0.12em] text-white/45"
                  >
                    {group.label}
                  </li>
                ) : (
                  index > 0 && (
                    <li aria-hidden="true" className="mx-auto mb-2 h-px w-6 bg-white/15" />
                  )
                ))}

              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={showExpanded ? undefined : item.label}
                      aria-current={isActive ? "page" : undefined}
                      className={railButtonClass(isActive)}
                    >
                      <Icon
                        size={19}
                        aria-hidden="true"
                        className={cn(
                          "shrink-0",
                          isActive ? "text-white" : "nav-item-dark-icon",
                        )}
                      />
                      {/* Colapsado o rótulo fica só pro leitor de tela —
                          `title` não é lido de forma confiável. */}
                      <span className={cn("truncate", !showExpanded && "sr-only")}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ))}
        </nav>

        {/* Rodapé: tema + recolher + sair */}
        <div
          className={cn(
            "flex shrink-0 flex-col gap-1 border-t border-white/8 py-3",
            showExpanded ? "px-3" : "px-4",
          )}
        >
          {/* Colapsado não cabe; no header tem outro, escondido abaixo de sm —
              aqui é o acesso ao tema no mobile. */}
          {showExpanded && (
            <div className="mb-1 flex items-center justify-between gap-2 px-1 sm:hidden">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Tema
              </span>
              <ThemeToggle tone="rail" />
            </div>
          )}

          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            className={cn(railButtonClass(), "hidden lg:flex")}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={19} className="nav-item-dark-icon shrink-0" />
            ) : (
              <PanelLeftClose size={19} className="nav-item-dark-icon shrink-0" />
            )}
            {showExpanded && <span className="truncate">Recolher</span>}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sair"
            aria-label="Sair"
            className={cn(railButtonBase, "nav-item-signout")}
          >
            <LogOut size={19} className="nav-item-signout-icon shrink-0" />
            {showExpanded && <span className="truncate">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
