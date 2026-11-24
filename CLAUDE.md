# ClassOn

Plataforma de gestão escolar com IA: TCC 2026 do Técnico em Desenvolvimento de
Sistemas (ETEC Dr. Geraldo José Rodrigues Alckmin, Taubaté). Três perfis:
secretaria, professor e aluno. Repo público: `github.com/devravel/class-on`.
Branch de trabalho: `feature/tcc-2026-presentation`.

Contexto e regras de negócio: `docs/PROJECT_CONTEXT.md`, `docs/SYSTEM_FLOWS.md`,
`docs/DATABASE_MODELING.md`. Contas de teste: `CREDENCIAIS_TESTE.md`.

## Stack

- Front: Next.js 16 + React 19 + Tailwind + shadcn/ui, na raiz (`src/`), porta 3000
- API: NestJS 10 em `backend/`, porta 3001, prefixo `/api`
- Banco: Postgres 15 via `docker compose`, Prisma 7 com `@prisma/adapter-pg`
- IA: Groq (`GROQ_MODEL`) → OpenAI → fallback local estruturado. A demo
  funciona sem chave nenhuma.

## Subir

```bash
docker compose up -d
cd backend && npm run start:dev   # ~40s depois do "Found 0 errors" pra abrir a :3001
npm run dev
```

Seed: `cd backend && npm run seed`. Usa `upsert` e não apaga nada antes de rodar.

## Onde a lógica mora

- `src/app/professor/turmas/[id]/TurmaDetailPage.tsx`: hub do professor (diário, notas, tarefas, alunos)
- `src/components/layout/CommandPalette.tsx`: Ctrl+K com intenção por IA (timeout 1,5s, cai pra `src/lib/command-intent.ts`)
- `backend/src/ai/ai.service.ts`: as 4 features de IA
- `backend/src/dashboard/analytics.service.ts`: heurística de risco
- `backend/prisma/seed.ts`: massa de demonstração e perfis de risco
- `scripts/benchmark.mjs`: números do resumo do CICTED

## Convenções que quebram se ignoradas

- ID é `BigInt`. A saída passa pelo `BigIntSerializationInterceptor` e a entrada
  pelo `ParseBigIntPipe`. Nunca tratar como `number`.
- Guard é por controller (`JwtAuthGuard` + `RolesGuard` + `@Roles`). Usuário
  logado: `@CurrentUser() user: AuthenticatedUser`, que já vem com
  `teacher`/`student` populados. Nada de `any`.
- A sessão fica no localStorage **e** no cookie (`auth_token`, `auth_role`). O
  cookie existe pro `src/middleware.ts` barrar rota por perfil.
- A fonte da verdade visual é `src/app/globals.css` + `tailwind.config.mjs`.
  `docs/DESIGN_SYSTEM.md` só vale pelos princípios.
- No escuro a escala `neutral-*` inverte. Chrome que é sempre escuro (landing,
  trilho) usa `ink-*`/`white`. Hover usa token próprio (`--primary-hover`).
- Logo duplicada em `src/components/brand/Logo.tsx` e `src/app/icon.svg`:
  mexeu num, mexe no outro. Sem caixa/tile em volta.
- `sed -i` em massa reescreve o fim de linha de todo arquivo que toca e suja o
  `git status`.
- Ficam fora do git (repo público): os `.docx` do resumo (têm e-mails
  pessoais), `banner/`, `prints/`, `.cursor/` e as referências do template em
  `public/referencias-reestilizacao-classon/`.
