"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/contexts/auth-context";

type Profile = "ALUNO" | "PROFESSOR" | "SECRETARIA";

const PROFILE_LABELS: Record<Profile, string> = {
  ALUNO: "Aluno",
  PROFESSOR: "Professor",
  SECRETARIA: "Secretaria",
};

const loginSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail valido." }),
  password: z.string().min(6, { message: "Minimo 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_PASSWORD = "123456";

const DEMO_CREDENTIALS = [
  { role: "Secretaria", email: "admin@classon.com", password: DEMO_PASSWORD },
  { role: "Professor", email: "prof1@classon.com", password: DEMO_PASSWORD },
  { role: "Aluno", email: "aluno0001@classon.com", password: DEMO_PASSWORD },
] as const;

const DEMO_PROFILE_BY_ROLE: Record<(typeof DEMO_CREDENTIALS)[number]["role"], Profile> = {
  Secretaria: "SECRETARIA",
  Professor: "PROFESSOR",
  Aluno: "ALUNO",
};

const isDevEnvironment = process.env.NODE_ENV === "development";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [profile, setProfile] = useState<Profile>("ALUNO");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setAuthError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthError("Credenciais invalidas.");
          return;
        }

        setAuthError("Não foi possivel entrar. Tente novamente.");
        return;
      }

      const result = (await response.json()) as {
        access_token: string;
        user: { id: string; email: string; role: UserRole };
      };

      if (result.user.role !== profile) {
        setAuthError(
          `Esta conta pertence ao perfil ${PROFILE_LABELS[result.user.role]}. Selecione o perfil correto e tente novamente.`,
        );
        return;
      }

      signIn(result.access_token, result.user);

      const rolePathMap: Record<UserRole, string> = {
        SECRETARIA: "/secretaria",
        PROFESSOR: "/professor",
        ALUNO: "/aluno",
      };

      router.push(rolePathMap[result.user.role] ?? "/");
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Erro de conexao com o servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemoCredentials(account: (typeof DEMO_CREDENTIALS)[number]) {
    setProfile(DEMO_PROFILE_BY_ROLE[account.role]);
    form.setValue("email", account.email, { shouldValidate: true });
    form.setValue("password", account.password, { shouldValidate: true });
    setAuthError(null);
  }

  const showDemoPanel = isDevEnvironment && step === 2;

  const demoAccountsList = (
    <>
      {DEMO_CREDENTIALS.map((account) => (
        <li key={account.email}>
          <button
            type="button"
            onClick={() => fillDemoCredentials(account)}
            className="w-full rounded-lg bg-neutral-50 px-3 py-2 text-left transition-colors hover:bg-primary/10 hover:ring-1 hover:ring-primary/20"
          >
            <p className="text-xs font-medium text-neutral-500">{account.role}</p>
            <p className="text-sm font-semibold text-neutral-900">{account.email}</p>
          </button>
        </li>
      ))}
    </>
  );

  return (
    <div className="app-shell-gradient min-h-screen font-sans">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
          <Card className="content-panel w-full max-w-[400px] shrink-0 rounded-[32px] border-0 p-8 shadow-medium ring-1 ring-white/10">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-8 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary underline underline-offset-2 transition-colors hover:text-brand-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
          )}

          <div className="text-center">
            <Image
              src="/assets/logo/no_name_logo.svg"
              alt="Logo ClassOn"
              width={35}
              height={32}
              className="mx-auto mb-10"
            />
            <h1 className="text-2xl font-bold text-neutral-900">
              Bem-vindo(a) ao ClassOn!
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {step === 1
                ? "Selecione seu perfil para acessar:"
                : "Para acessar sua conta, preencha os campos abaixo:"}
            </p>
          </div>

          {step === 1 ? (
            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-neutral-900">
                  Entrar como:
                </Label>
                <Select
                  value={profile}
                  onValueChange={(value: Profile) => setProfile(value)}
                >
                  <SelectTrigger className="h-11 cursor-pointer rounded-[8px] border-neutral-300 bg-white">
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALUNO">Aluno</SelectItem>
                    <SelectItem value="PROFESSOR">Professor</SelectItem>
                    <SelectItem value="SECRETARIA">Secretaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 w-full cursor-pointer rounded-[8px] bg-[var(--color-brand-700)] text-white hover:bg-[var(--color-brand-600)]"
              >
                Continuar
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-8 space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-neutral-900">
                        E-mail:
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Digite seu e-mail"
                          disabled={isLoading}
                          className={cn(
                            "h-11 rounded-[8px] border-neutral-300 bg-white placeholder:text-center",
                            fieldState.error &&
                              "border-error focus-visible:ring-error/30",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-error" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-semibold text-neutral-900">
                        Senha:
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          className={cn(
                            "h-11 rounded-[8px] border-neutral-300 bg-white placeholder:text-center",
                            fieldState.error &&
                              "border-error focus-visible:ring-error/30",
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-error" />
                    </FormItem>
                  )}
                />

                {authError && (
                  <p className="text-xs font-medium text-error">{authError}</p>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full cursor-pointer rounded-lg bg-[var(--color-brand-700)] text-white hover:bg-[var(--color-brand-600)]"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          )}
          </Card>

          {showDemoPanel && (
            <Card className="w-full max-w-[280px] shrink-0 rounded-[20px] border border-white/10 bg-white/95 p-5 shadow-medium backdrop-blur-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Contas de demonstração
              </p>
              <ul className="space-y-2.5">{demoAccountsList}</ul>
              <p className="mt-3 text-xs text-neutral-500">
                Clique em um perfil para preencher e-mail e senha. Senha:{" "}
                <span className="font-mono font-semibold text-neutral-700">{DEMO_PASSWORD}</span>
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
