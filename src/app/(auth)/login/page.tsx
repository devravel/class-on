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
      const response = await fetch("http://localhost:3001/api/auth/login", {
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
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-[400px] rounded-[12px] border-0 bg-gray-100 p-8 shadow-none ring-0">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mb-8 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[#4299E1] underline underline-offset-2 hover:text-primary-dark"
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
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo(a) ao ClassOn!
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {step === 1
                ? "Selecione seu perfil para acessar:"
                : "Para acessar sua conta, preencha os campos abaixo:"}
            </p>
          </div>

          {step === 1 ? (
            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Entrar como:
                </Label>
                <Select
                  value={profile}
                  onValueChange={(value: Profile) => setProfile(value)}
                >
                  <SelectTrigger className="h-11 cursor-pointer rounded-[8px] border-gray-300 bg-white">
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
                className="h-11 w-full cursor-pointer rounded-[8px] bg-[#2B6CB0] text-white hover:bg-[#255A93]"
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
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        E-mail:
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Digite seu e-mail"
                          disabled={isLoading}
                          className={cn(
                            "h-11 rounded-[8px] border-gray-300 bg-white placeholder:text-center",
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
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Senha:
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          className={cn(
                            "h-11 rounded-[8px] border-gray-300 bg-white placeholder:text-center",
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
                  className="h-11 w-full cursor-pointer rounded-[8px] bg-[#2B6CB0] text-white hover:bg-[#255A93]"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
}
