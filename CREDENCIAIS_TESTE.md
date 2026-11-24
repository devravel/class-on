# Credenciais de Teste - ClassOn

Contas criadas pelo seed (`backend/prisma/seed.ts`). Todas usam a senha **`123456`**.

## Secretaria
- **Email:** `admin@classon.com`

## Professores

| Disciplina | Nome | Email |
|---|---|---|
| Matemática | João Silva | `prof1@classon.com` |
| Português | Helena Alves | `prof.portugues@classon.com` |
| Ciências | Patricia Gomes | `prof.ciencias@classon.com` |
| História | Ricardo Mendes | `prof.historia@classon.com` |
| Geografia | Fernando Rocha | `prof.geografia@classon.com` |
| Arte | Camila Nascimento | `prof.arte@classon.com` |
| Educação Física | Marcelo Vieira | `prof.ef@classon.com` |
| Língua Inglesa | Sandra Oliveira | `prof.ingles@classon.com` |

## Alunos
- **Aluna da demonstração:** `aluno0183@classon.com` (Júlia Duarte Rodrigues, 2º Ano EM A).
  Está em alerta (frequência 80%), vai mal em Matemática e tem tarefas pendentes
  de 3 professores. É o atalho "Aluno" da tela de login. Esses dados foram
  montados no banco local em 23/11 (não vêm do seed).
- **Email:** `aluno0001@classon.com` até `aluno0220@classon.com`
- 220 alunos em 11 turmas (1º ao 8º ano do fundamental, 1º ao 3º do médio), 20 por turma

## URLs

- **Site:** http://localhost:3000 (landing pública)
- **Login:** http://localhost:3000/login
- **API:** http://localhost:3001/api

## Como entrar

1. Abra http://localhost:3000/login
2. Clique em um dos perfis de demonstração (Secretaria, Professor ou Aluno) para preencher e-mail e senha, ou selecione o perfil e digite as credenciais acima
3. Clique em "Entrar"

## Subir o ambiente

```bash
docker compose up -d             # Postgres, na raiz do projeto
cd backend && npm run start:dev  # API na :3001 — leva ~40s depois do "Found 0 errors"
npm run dev                      # front na :3000, na raiz
```

Sem a API na :3001, o login falha com `TypeError: Failed to fetch`.
