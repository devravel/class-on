"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { authApi } from "@/lib/api/auth";
import { getClassShortLabel, normalizeEducationLevel } from "@/lib/class-utils";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  SECRETARIA: "Secretaria",
  PROFESSOR: "Professor",
  ALUNO: "Aluno",
};

interface UserProfile {
  displayName: string;
  firstName: string;
  initials: string;
  roleLabel: string;
}

/**
 * Nome de exibição do usuário logado. Aluno e professor vêm do /me (nome
 * completo); secretaria cai no e-mail. Usado pelo chip do topo e pela saudação
 * do banner — daí ser hook, pra não duplicar o fetch.
 */
export function useUserProfile(): UserProfile | null {
  const { user } = useAuth();
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(
    null,
  );
  const [studentClassLabel, setStudentClassLabel] = useState<string | null>(
    null,
  );

  const isStudentAccess = user?.role === "ALUNO";
  const usesProfileName = user?.role === "ALUNO" || user?.role === "PROFESSOR";

  useEffect(() => {
    if (!usesProfileName) {
      setProfileDisplayName(null);
      setStudentClassLabel(null);
      return;
    }

    let cancelled = false;

    authApi
      .getMe()
      .then((me) => {
        if (cancelled) return;

        if (me.role === "ALUNO" && me.student) {
          setProfileDisplayName(me.student.full_name);

          if (me.student.current_class) {
            setStudentClassLabel(
              getClassShortLabel({
                ...me.student.current_class,
                education_level: normalizeEducationLevel(
                  me.student.current_class.education_level,
                ),
              }),
            );
          } else {
            setStudentClassLabel(null);
          }
          return;
        }

        if (me.role === "PROFESSOR" && me.teacher) {
          setProfileDisplayName(me.teacher.full_name);
          setStudentClassLabel(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfileDisplayName(null);
          setStudentClassLabel(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [usesProfileName]);

  if (!user) return null;

  const displayName =
    (usesProfileName && profileDisplayName ? profileDisplayName : user.email) ??
    "";

  const roleLabel = (() => {
    if (!user.role) return "";
    if (isStudentAccess && studentClassLabel) {
      return `Aluno - ${studentClassLabel}`;
    }
    return ROLE_LABEL[user.role] ?? "";
  })();

  return {
    displayName,
    // E-mail não tem "primeiro nome" — usa o trecho antes do @
    firstName: displayName.includes("@")
      ? displayName.split("@")[0]
      : displayName.split(" ")[0],
    initials: displayName[0]?.toUpperCase() ?? "U",
    roleLabel,
  };
}

interface UserProfileContainerProps {
  className?: string;
  /** Chip compacto do topo: só avatar + nome, sem o cargo em segunda linha. */
  compact?: boolean;
}

export function UserProfileContainer({
  className,
  compact = false,
}: UserProfileContainerProps) {
  const profile = useUserProfile();

  if (!profile) return null;

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <div className="flex size-9 shrink-0 select-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-brand">
        {profile.initials}
      </div>
      <div className={cn("min-w-0 flex-1", compact && "hidden sm:block")}>
        <p className="truncate text-sm font-semibold leading-tight text-text-primary">
          {profile.displayName}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-tertiary">
          {profile.roleLabel}
        </p>
      </div>
    </div>
  );
}
