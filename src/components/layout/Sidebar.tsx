"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { pageHeaderTopOffset } from "@/components/layout/PageContainer";
import { type NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

interface SidebarProps {
  navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { isCollapsed, isMobileOpen, closeMobile, toggleMobile } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const showExpanded = !isCollapsed || isHovered;

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  const sidebarPanelClass =
    "rounded-[28px] bg-black/45 shadow-medium ring-1 ring-white/10 backdrop-blur-sm";

  const navButtonClass = (active = false) =>
    cn(
      "group flex items-center rounded-full text-sm font-medium transition-colors",
      showExpanded
        ? "w-full gap-3 px-3 py-2.5"
        : "w-10 justify-center px-2 py-2.5",
      active
        ? "bg-primary text-white shadow-light"
        : "nav-item-dark",
    );

  return (
    <>
      {/* Mobile menu trigger — visible when sidebar is closed */}
      {!isMobileOpen && (
        <button
          type="button"
          onClick={toggleMobile}
          className="nav-item-dark-trigger fixed left-3 top-3 z-50 flex items-center justify-center rounded-full border border-white/20 bg-black/40 p-2 shadow-medium backdrop-blur-sm lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen flex-col justify-between bg-transparent",
          "transition-all duration-300 ease-in-out",
          "lg:static lg:z-auto lg:translate-x-0",
          isMobileOpen
            ? "translate-x-0 bg-black/80 shadow-medium backdrop-blur-md lg:bg-transparent"
            : "-translate-x-full lg:translate-x-0",
          showExpanded ? "w-60" : "w-[72px]",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "w-full shrink-0 px-3 pb-5",
            pageHeaderTopOffset,
          )}
        >
          <div className="flex items-center justify-center">
            {showExpanded ? (
              <img
                src="/assets/logo/logo-wordmark-light.svg"
                alt="ClassOn"
                className="max-h-[55.125px] w-[192.94px] object-contain object-center"
              />
            ) : (
              <img
                src="/assets/logo/no_name_logo-light.svg"
                alt="ClassOn"
                className="h-[35.7px] w-[35.7px] object-contain object-center"
              />
            )}
          </div>
        </div>

        {/* Navigation — centered in middle */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-2">
          <nav
            className={cn(
              sidebarPanelClass,
              "flex flex-col gap-1 p-2",
              showExpanded
                ? "w-[88%] max-w-[200px]"
                : "w-full items-center",
            )}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={showExpanded ? undefined : item.label}
                  className={navButtonClass(isActive)}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "shrink-0",
                      isActive
                        ? "text-white"
                        : "nav-item-dark-icon",
                    )}
                  />
                  {showExpanded && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sair — fixed at bottom left */}
        <div className="shrink-0 px-2">
          <div
            className={cn(
              "nav-item-signout-panel mb-5",
              "p-1",
              showExpanded
                ? "w-[88%] max-w-[200px] mx-auto"
                : "flex w-full items-center justify-center",
            )}
          >
            <button
              type="button"
              onClick={handleSignOut}
              title="Sair"
              aria-label="Sair"
              className={cn(
                "group flex items-center rounded-full text-sm font-medium transition-colors nav-item-signout",
                showExpanded
                  ? "w-full gap-2.5 px-2.5 py-2"
                  : "w-9 justify-center px-1.5 py-2",
              )}
            >
              <LogOut
                size={20}
                className="nav-item-signout-icon shrink-0"
              />
              {showExpanded && <span className="truncate">Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
