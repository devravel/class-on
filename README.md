# ClassOn — Sistema de Gestão Escolar

> Plataforma web completa de gestão educacional para o ensino médio, conectando secretaria, professores e alunos em um ambiente digital moderno e intuitivo.

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Stack Tecnológica](#stack-tecnológica)
- [Funcionalidades por Perfil](#funcionalidades-por-perfil)
- [Módulo de Inteligência Artificial](#módulo-de-inteligência-artificial)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Modelagem do Banco de Dados](#modelagem-do-banco-de-dados)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rotas da API](#rotas-da-api)
- [Autenticação e Controle de Acesso](#autenticação-e-controle-de-acesso)
- [Design System](#design-system)
- [Contribuição](#contribuição)

---

## Sobre o Projeto

O **ClassOn** é um sistema de gestão escolar desenvolvido como Trabalho de Conclusão de Curso (TCC), com foco em demonstrar uma arquitetura bem estruturada e boas práticas de desenvolvimento. O sistema atende três perfis de usuário — **Secretaria**, **Professor** e **Aluno** — oferecendo uma interface moderna no estilo SaaS administrativo.

**Objetivos centrais:**

- Centralizar e organizar os processos acadêmicos essenciais de uma escola de ensino médio.
- Proporcionar uma experiência de uso intuitiva e de alto desempenho.
- Fornecer uma base arquitetural preparada para integração futura com Inteligência Artificial.

O escopo atual é restrito ao ensino médio, com turmas organizadas por série (1º, 2º, 3º ano), letra (A, B, C, D) e turno.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Estilização** | Tailwind CSS v4 + shadcn/ui + Radix UI |
| **Backend** | NestJS 10 + TypeScript |
| **ORM** | Prisma 7 |
| **Banco de Dados** | PostgreSQL 15 |
| **Autenticação** | JWT (Passport.js) + bcryptjs |
| **Gráficos** | Recharts |
| **Calendário** | FullCalendar |
| **Ícones** | Lucide React |
| **Formulários** | React Hook Form + Zod |
| **Notificações** | Sonner |
| **IA** | Groq (Llama 3.1) / OpenAI (GPT-4o-mini) |
| **Containerização** | Docker (somente o banco de dados) |

---

## Funcionalidades por Perfil

### Secretaria

A secretaria possui acesso administrativo total ao sistema.

| Módulo | Funcionalidades |
|---|---|
| **Dashboard** | KPIs em tempo real: total de alunos, professores, turmas e ano letivo ativo. Lista de turmas ativas e comunicados recentes. |
| **Monitoramento Preditivo** | Análise de risco pedagógico dos alunos com gráfico de rosca (Estável / Alerta / Risco Crítico). Pesquisa por nome, turma ou status de risco. |
| **Anos Letivos** | Criação, ativação e encerramento de anos letivos. Cada ano contém 4 bimestres gerenciáveis. |
| **Turmas** | Criação via wizard multi-etapa (série, letra, turno, alunos e professores). Ativação e inativação de turmas. Encerramento com validação de resultados finais. |
| **Alunos** | Cadastro individual ou em lote. Matrícula e desmatrícula. Definição de resultado final (APROVADO / RETIDO / CONCLUÍDO). Progressão de turma entre anos letivos. |
| **Professores** | Cadastro, edição e ativação/desativação de professores. Gerenciamento de senha. |
| **Disciplinas** | Cadastro e gerenciamento de disciplinas (subjects). |
| **Atribuições** | Vinculação de professores a turmas e disciplinas específicas. |
| **Comunicados** | Criação e envio de comunicados institucionais. Controle de leitura por usuário. Segmentação por turma ou aluno específico. |
| **Agendão (Calendário)** | Criação e gerenciamento de eventos escolares. Escopo configurável: toda a escola, somente professores, somente alunos ou turmas específicas. |

---

### Professor

O professor acessa apenas as turmas às quais está atribuído.

| Módulo | Funcionalidades |
|---|---|
| **Dashboard** | Visão geral das turmas atribuídas e próximos eventos. |
| **Minhas Turmas** | Lista de turmas com acesso a notas, chamada e tarefas por turma. Visualização detalhada de alunos com desempenho individual. |
| **Notas** | Lançamento de notas por bimestre (N1, N2, N3, N4). Cálculo automático de média bimestral. Suporte a nota de recuperação e média final. |
| **Chamada** | Criação de aulas com data, número de ordem e conteúdo. Registro de presença (PRESENTE / AUSENTE) por aluno e por aula. |
| **Tarefas** | Criação de tarefas com título, descrição e prazo. Segmentação por turma inteira ou alunos específicos. Controle de status (ABERTA / FECHADA). **Gerador de Tarefas com IA**: cria enunciados a partir de título, série, PDF de conteúdo e pesquisa web curada. |
| **Plano de Aula (IA)** | Geração automática de plano de aula completo com objetivos, metodologia (50 min) e critérios de avaliação alinhados à BNCC. |
| **Comunicados** | Criação e visualização de comunicados. |
| **Agendão** | Visualização de eventos da escola e criação de novos eventos. |

---

### Aluno

O aluno acessa exclusivamente seus próprios dados acadêmicos.

| Módulo | Funcionalidades |
|---|---|
| **Dashboard** | Resumo do dia: próximas tarefas, comunicados recentes e eventos. |
| **Notas (Boletim)** | Visualização de notas por disciplina e bimestre. Médias, notas de recuperação e resultado parcial. |
| **Frequência** | Visualização de presença por disciplina. Percentual de frequência calculado automaticamente. |
| **Tarefas** | Listagem de tarefas abertas e encerradas. Marcação de entrega com observação opcional. |
| **Comunicados** | Leitura de comunicados institucionais direcionados à turma ou individualmente. |
| **Agendão** | Calendário de eventos escolares. |

---

## Módulo de Inteligência Artificial

O ClassOn possui um módulo de IA integrado ao backend que oferece quatro funcionalidades principais, com suporte a **Groq (Llama 3.1)** e **OpenAI (GPT-4o-mini)**, além de fallback estruturado quando nenhuma chave está configurada.

### 1. Gerador de Tarefas

Endpoint: `POST /api/ai/generate-task`

O professor fornece:
- Título da tarefa e ano escolar
- (Opcional) PDF com material de referência — o texto é extraído e usado como base das questões
- (Opcional) Links externos de referência
- (Opcional) Pesquisa web curada — o sistema seleciona automaticamente fontes confiáveis (Nova Escola, Khan Academy, Brasil Escola, BNCC/MEC) conforme a disciplina detectada

O resultado é uma tarefa completa em Markdown com: enunciado, objetivos de aprendizagem, instruções, questões variadas (objetivas e dissertativas) e seção de fontes.

Suporta também **refinamento iterativo**: o professor pode pedir ajustes no texto gerado sem recomeçar do zero.

### 2. Gerador de Plano de Aula

Endpoint: `POST /api/ai/generate-lesson-plan`

Gera planos de aula com 50 minutos estruturados em: Objetivos, Conteúdos, Metodologia, Recursos, Avaliação e Tarefa de Casa. Alinhado à BNCC.

### 3. Carta para Responsáveis

Endpoint: `POST /api/ai/generate-parent-report`

Gera cartas formais de notificação para responsáveis de alunos com baixo desempenho ou frequência. O tom é empático e profissional, com convite para reunião e plano de acompanhamento.

### 4. Interpretação de Comandos em Linguagem Natural (Command Intent)

Endpoint: `POST /api/ai/command-intent`

Interpreta comandos em texto livre do usuário e os converte em ações/rotas do sistema, respeitando o perfil autenticado. Possui fallback heurístico por expressões regulares e normalização de texto.

Exemplos:
- Secretaria: `"criar nova turma"` → `/secretaria/turmas/nova`
- Aluno: `"ver minhas notas"` → `/aluno/notas`
- Professor: `"realizar chamada da turma 2º A"` → ação `chamada` + turma detectada

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                │
│  /secretaria  /professor  /aluno  /monitoramento     │
│  App Router + React Contexts + React Hook Form       │
│  Port: 3000                                          │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP (JWT Bearer Token)
                       │
┌──────────────────────▼──────────────────────────────┐
│                   BACKEND (NestJS)                   │
│  /api/*  — 16 módulos REST                           │
│  Autenticação JWT + Guards por role                  │
│  Port: 3001                                          │
└──────────────────────┬──────────────────────────────┘
                       │  Prisma Client
                       │
┌──────────────────────▼──────────────────────────────┐
│              PostgreSQL 15 (Docker)                  │
│  Port: 5432                                          │
└─────────────────────────────────────────────────────┘
```

**Módulos do Backend:**

| Módulo | Responsabilidade |
|---|---|
| `auth` | Login por email/senha, emissão de JWT, endpoint `/me` |
| `academic-years` | CRUD de anos letivos, abertura e encerramento |
| `bimesters` | Controle manual dos 4 bimestres por ano letivo |
| `classes` | CRUD de turmas, wizard de criação, inativação |
| `students` | CRUD de alunos, matrículas, resultado final, progressão |
| `teachers` | CRUD de professores, gerenciamento de senha |
| `subjects` | CRUD de disciplinas |
| `assignments` | Vinculação professor + turma + disciplina |
| `grades` | Lançamento e cálculo de notas por bimestre |
| `lessons` | Criação de aulas com data e conteúdo |
| `attendance` | Registro de presença por aluno/aula |
| `tasks` | CRUD de tarefas, controle de entrega |
| `announcements` | Comunicados com rastreamento de leitura |
| `events` | Eventos do calendário escolar |
| `dashboard` | Analytics de risco pedagógico |
| `ai` | Geração de conteúdo e interpretação de comandos via LLM |

---

## Modelagem do Banco de Dados

O banco possui 18 entidades principais:

```
users               → base de autenticação (email + senha + role)
├── students        → alunos (RM único, vinculado ao user)
└── teachers        → professores (código de registro, vinculado ao user)

academic_years      → anos letivos (2025, 2026, ...)
└── bimesters       → 4 bimestres por ano (ABERTO / FECHADO)

classes             → turmas (série + letra + turno + ano)
└── enrollments     → matrícula do aluno em turma (com resultado final)
    └── grades      → notas (n1, n2, n3, n4, média, recuperação)

assignments         → professor + turma + disciplina
├── lessons         → aulas criadas (com data e conteúdo)
│   └── attendances → presença por aluno/aula
├── grades          → (também vinculado a assignment)
└── tasks           → tarefas
    ├── task_targets    → alunos destinatários específicos
    └── task_submissions → entregas dos alunos

announcements       → comunicados
├── announcement_reads → controle de leitura
└── announcements_targets → turmas/alunos destinatários

events              → eventos do calendário
└── event_targets   → turmas destinatárias

conversations       → conversa privada aluno ↔ professor
└── messages        → mensagens da conversa
```

**Regras de negócio relevantes:**
- O RM do aluno é único e é usado como login — não é chave primária.
- Turmas possuem unicidade parcial (série + letra + turno + ano) por índice parcial para turmas ativas.
- Notas são registradas por `(enrollment, assignment, bimester)` — único por combinação.
- Presença é registrada por `(student, lesson)` — única por combinação.
- O encerramento de turma só é permitido quando todos os alunos possuem resultado final definido.

---

## Estrutura do Repositório

```
class-on-main/
├── backend/                      # API NestJS
│   ├── prisma/
│   │   ├── schema.prisma         # Modelagem completa do banco
│   │   ├── seed.ts               # Seed com dados de demonstração
│   │   └── migrations/           # Histórico de migrations
│   └── src/
│       ├── academic-years/       # Módulo de anos letivos
│       ├── ai/                   # Módulo de IA (geração + command intent)
│       ├── announcements/        # Módulo de comunicados
│       ├── assignments/          # Módulo de atribuições
│       ├── attendance/           # Módulo de frequência
│       ├── auth/                 # Autenticação JWT + guards + strategies
│       ├── bimesters/            # Módulo de bimestres
│       ├── classes/              # Módulo de turmas + wizard
│       ├── dashboard/            # Analytics e risco pedagógico
│       ├── events/               # Módulo de eventos/calendário
│       ├── grades/               # Módulo de notas
│       ├── lessons/              # Módulo de aulas
│       ├── prisma/               # PrismaService (injeção de dependência)
│       ├── students/             # Módulo de alunos
│       ├── subjects/             # Módulo de disciplinas
│       ├── tasks/                # Módulo de tarefas
│       ├── teachers/             # Módulo de professores
│       └── app.module.ts         # Módulo raiz
│
├── src/                          # Frontend Next.js
│   ├── app/
│   │   ├── (auth)/login/         # Tela de login
│   │   ├── secretaria/           # Área da secretaria
│   │   │   ├── academic-years/   # Anos letivos
│   │   │   ├── alunos/           # Gestão de alunos
│   │   │   ├── atribuicoes/      # Atribuições professor/disciplina
│   │   │   ├── calendario/       # Agendão
│   │   │   ├── comunicados/      # Comunicados
│   │   │   ├── disciplinas/      # Disciplinas
│   │   │   ├── professores/      # Professores
│   │   │   └── turmas/           # Turmas
│   │   ├── professor/            # Área do professor
│   │   │   ├── calendario/       # Agendão
│   │   │   ├── comunicados/      # Comunicados
│   │   │   ├── tarefas/          # Tarefas
│   │   │   └── turmas/           # Minhas turmas (notas + chamada)
│   │   ├── aluno/                # Área do aluno
│   │   │   ├── calendario/       # Agendão
│   │   │   ├── comunicados/      # Comunicados
│   │   │   ├── frequencia/       # Frequência
│   │   │   ├── notas/            # Boletim
│   │   │   └── tarefas/          # Tarefas
│   │   └── monitoramento/        # Monitoramento preditivo (secretaria)
│   ├── components/               # Componentes React reutilizáveis
│   │   ├── ai/                   # Modais de IA
│   │   ├── announcements/        # Componentes de comunicados
│   │   ├── classes/              # Wizard e cards de turma
│   │   ├── dashboard/            # KpiCard, ListCard, RiskDonutChart
│   │   ├── events/               # CalendarView, EventForm
│   │   ├── grades/               # GradeStatusBadge
│   │   ├── layout/               # Sidebar, Header, PageContainer
│   │   ├── students/             # Formulários e diálogos de aluno
│   │   ├── tasks/                # TaskDetailDialog
│   │   ├── teachers/             # Formulários de professor
│   │   └── ui/                   # Primitivos shadcn/ui
│   ├── contexts/
│   │   ├── auth-context.tsx      # Contexto de autenticação global
│   │   ├── page-header-context.tsx
│   │   └── sidebar-context.tsx
│   ├── lib/
│   │   ├── api/                  # Funções de chamada à API por entidade
│   │   ├── api-client.ts         # Axios/fetch wrapper com token JWT
│   │   ├── auth-storage.ts       # Persistência de token no localStorage
│   │   ├── nav-config.ts         # Configuração da navegação por role
│   │   └── utils.ts              # Utilitários gerais (cn, formatação)
│   └── types/                    # Tipos TypeScript globais
│
├── docs/                         # Documentação do projeto
│   ├── PROJECT_CONTEXT.md        # Visão e escopo do projeto
│   ├── DATABASE_MODELING.md      # Modelagem e regras do banco
│   ├── DESIGN_SYSTEM.md          # Sistema de design e tokens visuais
│   ├── DEVELOPMENT_STRATEGY.md   # Estratégia de desenvolvimento
│   └── SYSTEM_FLOWS.md           # Fluxos do sistema
│
├── docker-compose.yml            # PostgreSQL containerizado
├── .env.example                  # Variáveis de ambiente de exemplo
└── package.json                  # Dependências do frontend
```

---

## Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) com WSL2 ativo (Windows)
- npm

### 1. Clonar e instalar dependências

```bash
# Frontend (raiz do projeto)
npm install

# Backend
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Na raiz do projeto
cp .env.example .env

# No backend
cp backend/.env.example backend/.env
```

Edite os arquivos `.env` com as configurações adequadas (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)).

### 3. Subir o banco de dados

```bash
# Na raiz do projeto
docker compose up -d
```

O PostgreSQL estará disponível na porta `5432`.

### 4. Rodar as migrations e seed

```bash
cd backend

# Gerar o Prisma Client
npx prisma generate

# Aplicar as migrations
npx prisma migrate deploy

# Popular o banco com dados de demonstração
npm run seed
```

### 5. Iniciar os servidores

```bash
# Terminal 1 — Backend (porta 3001)
cd backend
npm run start:dev

# Terminal 2 — Frontend (porta 3000)
# Na raiz do projeto
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Comandos úteis

| Ação | Comando |
|---|---|
| Subir banco | `docker compose up -d` |
| Parar banco | `docker compose down` |
| Ver logs do banco | `docker compose logs -f` |
| Rodar seed | `npm run db:seed` (raiz) |
| Gerar Prisma Client | `npm run db:generate` (raiz) |
| Build frontend | `npm run build` |
| Build backend | `cd backend && npm run build` |

---

## Variáveis de Ambiente

### Frontend (`.env` na raiz)

```env
# URL do backend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)

```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/classon_db

# JWT
JWT_SECRET=seu_segredo_jwt_aqui

# Configurações do servidor
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:3000

# Inteligência Artificial (opcional — um dos dois)
GROQ_API_KEY=sua_chave_groq         # Recomendado (Llama 3.1, gratuito)
GROQ_MODEL=llama-3.1-8b-instant     # Modelo padrão Groq

OPENAI_API_KEY=sua_chave_openai     # Alternativa (GPT-4o-mini)
OPENAI_MODEL=gpt-4o-mini            # Modelo padrão OpenAI
```

> **Nota sobre IA:** O módulo de IA funciona sem chaves configuradas, usando fallbacks estruturados. Para geração generativa completa, configure `GROQ_API_KEY` (gratuito) ou `OPENAI_API_KEY`.

### Docker (`docker-compose.yml`)

```env
POSTGRES_USER=classon_user
POSTGRES_PASSWORD=classon_password
POSTGRES_DB=classon_db
```

---

## Rotas da API

Todas as rotas são prefixadas com `/api`. A autenticação usa Bearer Token JWT no header `Authorization`.

### Autenticação

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login por email e senha | Não |
| `GET` | `/api/auth/me` | Dados do usuário autenticado | Sim |

### Anos Letivos

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/academic-years` | Listar anos letivos |
| `GET` | `/api/academic-years/active` | Obter ano letivo ativo |
| `POST` | `/api/academic-years` | Criar ano letivo |
| `PATCH` | `/api/academic-years/:id` | Atualizar status |

### Bimestres

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/bimesters?yearId=:id` | Listar bimestres do ano |
| `POST` | `/api/bimesters` | Criar bimestre |
| `PATCH` | `/api/bimesters/:id` | Abrir ou fechar bimestre |

### Turmas, Alunos, Professores, Disciplinas

Cada entidade segue o padrão REST com `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`.

| Recurso | Prefixo |
|---|---|
| Turmas | `/api/classes` |
| Alunos | `/api/students` |
| Professores | `/api/teachers` |
| Disciplinas | `/api/subjects` |
| Atribuições | `/api/assignments` |

### Notas, Frequência, Tarefas

| Recurso | Prefixo |
|---|---|
| Notas | `/api/grades` |
| Aulas | `/api/lessons` |
| Presenças | `/api/attendances` |
| Tarefas | `/api/tasks` |

### Comunicados e Eventos

| Recurso | Prefixo |
|---|---|
| Comunicados | `/api/announcements` |
| Eventos | `/api/events` |

### Analytics e IA

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/analytics/risk` | Análise de risco pedagógico |
| `POST` | `/api/ai/generate-task` | Gerar tarefa com IA |
| `POST` | `/api/ai/generate-lesson-plan` | Gerar plano de aula |
| `POST` | `/api/ai/generate-parent-report` | Gerar carta para responsáveis |
| `POST` | `/api/ai/command-intent` | Interpretar comando em linguagem natural |

---

## Autenticação e Controle de Acesso

O sistema utiliza **JWT (JSON Web Token)** com guard global `JwtAuthGuard`. Cada token carrega o `role` do usuário.

### Perfis (roles)

| Role | Descrição |
|---|---|
| `SECRETARIA` | Acesso total — gerencia todos os módulos |
| `PROFESSOR` | Acesso às turmas atribuídas — notas, chamada, tarefas |
| `ALUNO` | Acesso somente leitura dos próprios dados |

### Login

- **Secretaria:** e-mail + senha definidos na criação da conta
- **Professor:** e-mail + senha definidos pela secretaria
- **Aluno:** RM (Registro de Matrícula) + senha provisória (alterável no primeiro acesso)

### Proteção de rotas no frontend

O middleware `src/middleware.ts` intercepta todas as rotas e redireciona para `/login` caso não haja token válido. O `AuthContext` gerencia o estado de sessão globalmente.

---

## Design System

O ClassOn segue um design system documentado em [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md).

### Paleta de Cores

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#4299E1` | Ações principais, links, foco |
| `success` | `#48BB78` | Status positivo |
| `warning` | `#ED8936` | Alertas |
| `error` | `#F56565` | Erros e risco crítico |
| `gray-900` | `#1A202C` | Sidebar e texto primário |

### Princípios

- Interface limpa e de baixo ruído visual
- Foco em produtividade com acesso rápido às ações principais
- Padrão SaaS administrativo com layout de sidebar fixa
- Tipografia Inter com escala clara
- Componentes base: shadcn/ui + Radix UI primitives

---

## Contribuição

Antes de contribuir, leia o [Guia de Contribuição](./CONTRIBUTING.md).

**Fluxo de trabalho:**

```bash
# Sempre sincronize antes de começar
git pull origin main

# Crie uma branch para sua feature
git checkout -b feature/nome-da-feature

# Após o desenvolvimento
git add .
git commit -m "feat: descrição da mudança"
git push origin feature/nome-da-feature

# Abra um Pull Request no GitHub
```

---

## Documentação Adicional

| Documento | Descrição |
|---|---|
| [`docs/PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md) | Visão, escopo e decisões de produto |
| [`docs/DATABASE_MODELING.md`](./docs/DATABASE_MODELING.md) | Modelagem detalhada do banco de dados |
| [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) | Tokens visuais, componentes e padrões de UI |
| [`docs/DEVELOPMENT_STRATEGY.md`](./docs/DEVELOPMENT_STRATEGY.md) | Estratégia e ordem de desenvolvimento |
| [`docs/SYSTEM_FLOWS.md`](./docs/SYSTEM_FLOWS.md) | Fluxos detalhados do sistema |
| [`backend/PRISMA_SETUP.md`](./backend/PRISMA_SETUP.md) | Configuração e uso do Prisma ORM |

---

<p align="center">
  Desenvolvido como Trabalho de Conclusão de Curso (TCC)
</p>
