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

interface UserProfileContainerProps {
  className?: string;
}

export function UserProfileContainer({ className }: UserProfileContainerProps) {
  const { user } = useAuth();
  const [profileDisplayName, setProfileDisplayName] = useState<string | null>(
    null,
  );
  const [studentClassLabel, setStudentClassLabel] = useState<string | null>(
    null,
  );

  const isStudentAccess = user?.role === "ALUNO";
  const usesProfileName =
    user?.role === "ALUNO" || user?.role === "PROFESSOR";
  const profileName =
    usesProfileName && profileDisplayName ? profileDisplayName : user?.email;
  const initials =
    profileName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U";
  const roleLabel = (() => {
    if (!user?.role) return "";
    if (isStudentAccess && studentClassLabel) {
      return `Aluno - ${studentClassLabel}`;
    }
    return ROLE_LABEL[user.role] ?? "";
  })();

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

  return (
    <div
      className={cn("flex min-w-0 items-center gap-3", className)}
    >
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-none text-text-primary">
          {profileName}
        </p>
        <p className="mt-0.5 truncate text-xs text-text-secondary">
          {roleLabel}
        </p>
      </div>
    </div>
  );
}
