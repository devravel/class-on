# 🚀 DEVELOPMENT STRATEGY — ClassOn

---

## 🎯 Objetivo

Definir como deve ser construído o sistema de forma:

- consistente
- modular
- escalável
- alinhada com o banco e fluxos definidos

---

## 🧩 Ordem de Desenvolvimento (OBRIGATÓRIA)

### Fase 1 — Base do Sistema

1. Auth (login + RBAC)
2. Layout base (sidebar + header)
3. Proteção de rotas (por perfil)

---

### Fase 2 — Núcleo Acadêmico

4. Turmas (classes)
5. Alunos (students + enrollments)
6. Professores (teachers)
7. Disciplinas (subjects)
8. Atribuições (assignments)

---

### Fase 3 — Operacional Acadêmico

9. Bimestres
10. Notas (grades)
11. Aulas (lessons)
12. Frequência (attendances)

---

### Fase 4 — Produtividade

13. Tarefas (tasks)
14. Entregas (task_submissions)

---

### Fase 5 — Comunicação

15. Comunicados (announcements)
16. Chat privado (conversations + messages)

---

## 🏗️ Padrão Backend (NestJS)

Cada módulo deve conter:

- controller
- service
- dto
- prisma integration
- guards (quando necessário)
- enums
- validators

### Regras obrigatórias

- nunca acessar Prisma direto no controller
- validações no DTO + service
- regras de negócio no service
- usar enums do banco

---

## 🔐 RBAC (CRÍTICO)

Perfis:

- SECRETARIA
- PROFESSOR
- ALUNO

### Regras

- proteger rotas
- validar permissões no backend
- frontend apenas reflete (não decide segurança)

---

## 🧠 Regras de Negócio Críticas

A IA DEVE RESPEITAR:

### Notas

- só editar se bimestre = OPEN

### Frequência

- não existe presença sem aula

### Matrícula

- aluno pode ter várias turmas (histórico)

### Comunicados

- aluno NÃO cria
- professor limitado às turmas
- secretaria global

---

## 🎨 Frontend (Next.js)

### Stack obrigatória

- App Router
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

---

### Estrutura

- /app/(auth)
- /app/(secretaria)
- /app/(professor)
- /app/(aluno)

---

### Padrões

- layout por perfil
- components reutilizáveis
- hooks por módulo
- separação clara UI / lógica

---

## 🔄 Data Fetching

- padrão único (fetch ou react-query)
- tratar loading
- tratar error
- tratar empty state

---

## 🧩 UI Guidelines

- seguir DESIGN_SYSTEM.md
- usar tokens (cores, spacing, etc)
- não usar valores hardcoded
- manter consistência visual

---

## 🧪 Estratégia de Testes

Para cada módulo:

### Backend

- testar endpoints
- validar regras de negócio
- validar RBAC

### Frontend

- testar fluxo completo
- testar estados
- testar com diferentes perfis

---

## ⚙️ Fluxo de Desenvolvimento (OBRIGATÓRIO)

Para cada módulo:

1. entender fluxo no SYSTEM_FLOWS.md
2. validar tabela no DATABASE_MODELING.md
3. implementar backend
4. testar endpoints
5. implementar frontend
6. testar fluxo completo
7. validar com diferentes perfis

---

## 🚫 Regras Importantes

- NÃO pular etapas
- NÃO misturar módulos
- NÃO inventar regras fora dos docs
- NÃO ignorar banco de dados
- NÃO usar dados mockados após backend pronto

---

## 🤖 Diretrizes para IA

A IA deve:

- seguir este documento como prioridade
- usar PROJECT_CONTEXT.md como base conceitual
- usar DATABASE_MODELING.md como fonte de verdade
- usar SYSTEM_FLOWS.md para lógica

---

## 🏁 Definição de Concluído (Definition of Done)

Um módulo só está pronto quando:

- backend funcional
- frontend funcional
- regras respeitadas
- RBAC validado
- sem inconsistências com banco
- UI consistente

---
