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

const loginSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail valido." }),
  password: z.string().min(6, { message: "Minimo 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_CREDENTIALS = [
  { role: "Secretaria", email: "admin@classon.com" },
  { role: "Professor", email: "prof1@classon.com" },
  { role: "Aluno", email: "aluno1@classon.com" },
] as const;

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

  return (
    <div className="min-h-screen bg-neutral-100 font-sans">
      <div className="flex min-h-screen items-center justify-center gap-6 p-6">
        {isDevEnvironment && (
          <Card className="hidden w-full max-w-[280px] rounded-[12px] border border-neutral-200 bg-white p-5 shadow-sm lg:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Contas de demonstração
            </p>
            <ul className="space-y-2.5">
              {DEMO_CREDENTIALS.map((account) => (
                <li key={account.email} className="rounded-lg bg-neutral-50 px-3 py-2">
                  <p className="text-xs font-medium text-neutral-500">{account.role}</p>
                  <p className="text-sm font-semibold text-neutral-900">{account.email}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-neutral-500">
              Senha padrão: <span className="font-mono font-semibold text-neutral-700">123456</span>
            </p>
          </Card>
        )}

        <Card className="w-full max-w-[400px] rounded-[12px] border-0 bg-neutral-100 p-8 shadow-none ring-0">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-8 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
          )}

          <div className="text-center">
            <Image
              src="/assets/logo/no_name_logo.svg"
              alt="Logo ClassOn"
              width={33}
              height={30}
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

        {isDevEnvironment && (
          <Card className="w-full max-w-[400px] rounded-[12px] border border-neutral-200 bg-white p-4 shadow-sm lg:hidden">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Demo — senha: 123456
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-700">
              {DEMO_CREDENTIALS.map((account) => (
                <span key={account.email} className="rounded-full bg-neutral-100 px-2.5 py-1">
                  {account.role}: {account.email}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
