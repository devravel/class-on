# 🎯 CLASSON — DIRETRIZ MASTER COMPOSER (SPRINT DE APRESENTAÇÃO — 27 DE JUNHO)

## 📌 1. Visão Geral e Objetivo da Sprint

O objetivo desta sprint é preparar o ClassOn para vencer o evento de tecnologia no dia 27 de Junho de 2026.

Não buscamos terminar um ERP escolar tradicional e massivo. O foco absoluto é demonstrar um **Ecossistema Inteligente Conectado End-to-End (Secretaria → Professor → Aluno)**. As ações operacionais básicas do dia a dia (lançar uma nota ou falta) devem alimentar recursos preditivos (dashboards dinâmicos) e automações com Inteligência Artificial Generativa em tempo real.

---

## 🛠️ 2. Status Técnico e Regras de Ouro para a IA

### Stack Tecnológica Fixa

- **Backend:** NestJS 10, Prisma 7, PostgreSQL (Docker), JWT, RBAC via Guards.
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, FullCalendar, Recharts ou Tremor.

### 🚨 Regras Críticas de Implementação (DoD)

1. **Proibido Alterar o Schema do Banco:** O arquivo `backend/prisma/schema.prisma` já possui modelagem completa para todas as tabelas (`users`, `students`, `teachers`, `classes`, `grades`, `lessons`, `attendance`, `tasks`, `events`, `announcements`, etc.). Escreva a lógica de negócios e as queries adaptando-se estritamente ao schema atual.
2. **Consistência de Design:** Reutilize integralmente os padrões estéticos baseados em Tailwind CSS presentes nos arquivos maduros da pasta `src/app/secretaria/`.
3. **Tipagem Estrita:** Todos os novos fluxos de dados, respostas de API e payloads de DTO devem estar explicitamente tipados em TypeScript. **Não utilize `any`**.
4. **Zero Mocks na Apresentação:** Todos os KPIs e gráficos devem consumir dados reais originados do backend via clientes de API.

---

## 📅 3. Cronograma e Fluxo de Trabalho Integrado

```text
[Dias 1-2] FASE 0: Desbloqueio do Core BE + Wow Factor 1 (Cmd + K)
↓
[Dias 3-4] FASE 1: Tela Unificada do Professor + Wow Factor 2 (Gráfico de Risco)
↓
[Dia 5]    FASE 2: Fluxo do Aluno + Wow Factor 3 (Copiloto com IA Generativa)
↓
[Dias 6-7] FASE 3: Polimento Visual, Limpeza e Roteiro Anti-Crash
```

---

## 💬 4. Sequência de Prompts para o Cursor AI (Modo Composer / High Effort)

Execute os prompts abaixo rigorosamente na ordem estipulada, aguardando a conclusão e validação de cada etapa antes de avançar para a próxima.

### 🔹 BLOCO 1: INFRAESTRUTURA E INTERFACE MODERNA (DIAS 1-2)

#### PROMPT 01: Correção Crítica de JWT, RBAC e Ordem de Rotas (NestJS)

> **Contexto:** Alvo: `backend/src/auth/strategies/jwt.strategy.ts`, `backend/src/auth/auth.controller.ts`, `backend/src/assignments/assignments.controller.ts` e `backend/src/tasks/tasks.controller.ts`.
>
> **Prompt:** "Preciso corrigir os bloqueadores de infraestrutura e rotas do NestJS descritos no checklist de status:
>
> 1. No `jwt.strategy.ts`, altere o método `validate(payload)` para que, usando o Prisma, ele busque o usuário no banco de dados. Se a role for 'TEACHER', inclua a relação da tabela `teachers`. Se for 'STUDENT', inclua `students`. Anexe o objeto correspondente ao retorno para que todas as rotas acadêmicas subsequentes tenham acesso direto a `req.user.teacher.id` ou `req.user.student.id`.
> 2. No `auth.controller.ts`, certifique-se de que o endpoint `GET /auth/me` retorna exatamente essa estrutura de usuário enriquecida.
> 3. No `assignments.controller.ts`, reordene as rotas de forma que as rotas específicas `GET /teacher/:teacherId` e `GET /class/:classId` fiquem declaradas ANTES da rota genérica com ID parâmetro `GET /:id`.
> 4. No `tasks.controller.ts`, mova a rota `GET /student/me` para ficar ANTES de `GET /:id`.
>
> Garantir que exceções HTTP adequadas (como `ForbiddenException` ou `UnauthorizedException`) sejam lançadas caso o perfil esperado esteja ausente nas requisições do cabeçalho."

---

#### PROMPT 02: Módulo de Bimestres Automáticos (Backend)

> **Contexto:** Alvo: Nova pasta `backend/src/bimesters/` e modificação em `backend/src/academic-years/academic-years.service.ts`.
>
> **Prompt:** "Crie um módulo completo para Bimestres (`bimesters`) de acordo com o schema existente:
>
> 1. Crie os DTOs para criação (number de 1 a 4, status ABERTO/FECHADO, year_id) e atualização de status.
> 2. Crie as rotas:
>    - `POST /bimesters` (SECRETARIA)
>    - `GET /bimesters/year/:yearId` (Acesso livre autenticado)
>    - `PATCH /bimesters/:id` para alterar o status.
>
> 3. No `academic-years.service.ts`, altere o fluxo de criação de Anos Letivos: use uma Transação do Prisma para que, sempre que a Secretaria criar um ano letivo ativo, o sistema insira automaticamente 4 registros de bimestres (1º, 2º, 3º e 4º) vinculados a esse ano com status inicial 'ABERTO'."

---

#### PROMPT 03: Wow Factor 1 — Barra de Busca Global `Cmd + K` (Next.js)

> **Contexto:** Alvo: Criar `src/components/layout/CommandPalette.tsx` e integrá-lo ao layout ou sidebar global no Next.js 16.
>
> **Prompt:** "Utilizando React 19, TypeScript e Tailwind CSS, crie uma barra de comando estilo paleta flutuante (Command Palette), acionada globalmente pelo atalho 'Cmd+K' ou 'Ctrl+K':
>
> 1. O modal deve abrir de forma centralizada e sobreposta, com fundo desfocado (backdrop-blur) e animação suave de transição.
> 2. Adicione ações estáticas com ícones modernos para navegação rápida:
>    - 'Ir para Secretaria' (`/secretaria`)
>    - 'Lançar Notas (Professor)' (`/professor/turmas`)
>    - 'Ver Meu Boletim (Alunos)' (`/aluno/notas`)
>    - 'Enviar Comunicado' (`/secretaria/comunicados`)
>
> 3. Inclua um campo de pesquisa de texto. Se digitado o nome de alunos simulados do nosso seed, ofereça atalhos rápidos de visualização. O componente deve ser limpo, performático e visualmente impressionante."

---

### 🔹 BLOCO 2: ÁREA DO PROFESSOR E ANALYTICS PREDITIVO (DIAS 3-4)

#### PROMPT 04: Seed de Alta Fidelidade (Prisma)

> **Contexto:** Alvo: `backend/prisma/seed.ts`.
>
> **Prompt:** "Reescreva o script de seed para criar um cenário de demonstração perfeito sem quebrar as restrições ou chaves do banco de dados:
>
> 1. Crie 1 Ano Letivo Ativo (2026) e garanta que ele possua os 4 bimestres criados.
> 2. Crie as disciplinas:
>    - 'Matemática'
>    - 'Português'
>    - 'História'
>
> 3. Crie a turma:
>    - '9º Ano A'
>
> 4. Crie 1 usuário Professor (`prof1@classon.com`) e vincule ao registro da tabela `teachers`.
> 5. Crie 5 usuários Alunos (ex: `aluno1@classon.com` até `aluno5@classon.com`) vinculados de forma íntegra na tabela `students`, atribuindo matrículas estruturadas à turma '9º Ano A'.
> 6. Crie as Atribuições (`assignments`) relacionando o Professor 1 à disciplina de Matemática na turma 9º Ano A.
>
> Todas as senhas devem ser salvas usando o padrão de hash correto do projeto (ou bcrypt padrão se aplicável) para permitir o login imediato no frontend."

---

#### PROMPT 05: Página Unificada do Professor (Aulas, Chamadas e Notas)

> **Contexto:** Alvo: Novo arquivo em `src/app/professor/turmas/[id]/page.tsx` baseado em React 19 e Tailwind. Criar previamente os clientes de API necessários em `src/lib/api/`.
>
> **Prompt:** "Crie a página centralizada de gestão de turmas do professor contendo uma navegação limpa em 3 abas:
>
> 1. Aba 'Diário de Classe': Exibe a lista de alunos matriculados naquela turma/atribuição. Permite abrir uma nova Aula (`lessons`) e marcar de forma massiva a presença ou ausência dos alunos, salvando em lote na entidade `attendance`.
> 2. Aba 'Lançamento de Notas': Exibe uma tabela dinâmica com os alunos da turma. Deve conter inputs individuais para as avaliações estruturadas (N1, N2, N3, N4) para o bimestre selecionado, cálculo automático da média e um campo para nota de recuperação (`recovery_grade`). A média mínima para aprovação é 6.0. Salve consumindo a API de `grades`.
> 3. Aba 'Tarefas': Formulário rápido para criar uma tarefa vinculada àquela atribuição com campo de título, descrição e data de entrega, persistindo em `tasks`.
>
> Tudo deve consumir clientes de API dinâmicos que se comunicam real com o backend do NestJS."

---

#### PROMPT 06: Wow Factor 2 — Motor e Gráfico Preditivo de Risco Escolar

> **Contexto:** Alvo: Criar rota no NestJS (ex: `backend/src/dashboard/analytics.controller.ts`) e alterar o frontend em `src/app/secretaria/page.tsx`.
>
> **Prompt:** "Implemente um sistema de monitoramento de risco preditivo baseado em heurística analítica direta:
>
> 1. No backend, crie o endpoint `GET /dashboard/analytics/risk`. Ele deve computar um score de risco para cada aluno baseado na seguinte fórmula:
>
>    Score = Pontos_Nota + Pontos_Frequencia
>    - Se a Média de Notas do aluno for menor que 6.0: Adiciona 40 pontos.
>    - Se a Frequência do aluno for menor que 75% (Presença): Adiciona 50 pontos.
>    - Se a Frequência estiver entre 75% e 85%: Adiciona 20 pontos.
>    - Se o Score for maior que 60, classifique o aluno na categoria 'Risco Crítico'.
>    - Se estiver entre 20 e 60, 'Alerta'.
>    - Caso contrário, 'Estável'.
>
>    Retorne o consolidado com as contagens e nomes.
>
> 2. No frontend da Secretaria (`src/app/secretaria/page.tsx`), substitua qualquer dado mockado por um gráfico de rosca/pizza (Donut Chart usando Recharts ou Tremor) renderizando essas métricas em tempo real. Se o professor alterar uma nota ou presença em sua própria área, o gráfico da secretaria deve refletir a mudança imediatamente após o refresh da página."

---

### 🔹 BLOCO 3: VISTA DO ALUNO E COPILOTO COM IA GENERATIVA (DIA 5)

#### PROMPT 07: Boletim e Central de Tarefas do Aluno

> **Contexto:** Alvo: `src/app/aluno/notas/page.tsx` e `src/app/aluno/tarefas/page.tsx`.
>
> **Prompt:** "Crie as interfaces logadas do perfil Aluno de forma totalmente funcional, consumindo dados dinâmicos do backend via ID do token:
>
> 1. Na página de notas (`/aluno/notas`), exiba o boletim estruturado do aluno em formato de tabela responsiva, dividida por disciplinas e bimestres, exibindo N1, N2, N3, N4, a Média calculada, a nota de recuperação e o status (Aprovado / Em Recuperação / Reprovado). Exiba também uma barra de progresso visual com a porcentagem total de sua frequência escolar com base nas faltas calculadas.
> 2. Na página de tarefas (`/aluno/tarefas`), exiba a listagem das atividades atribuídas à turma dele. Ao selecionar a tarefa, exiba um formulário simples em modal para envio de resposta textual, persistindo na tabela `task_submissions`."

---

#### PROMPT 08: Wow Factor 3 — Copiloto ClassOn IA (Planos e Relatórios)

> **Contexto:** Alvo: Criar `backend/src/ai/` (Module, Controller, Service). Alterar `src/app/professor/turmas/[id]/page.tsx` e `src/app/secretaria/page.tsx`.
>
> **Prompt:** "Integre suporte a IA generativa nativa no ecossistema utilizando chamadas HTTP diretas ou o SDK oficial para uma LLM rápida (pode usar OpenAI GPT-4o-mini ou Groq Cloud Llama 3 via variáveis de ambiente):
>
> 1. No backend, crie a rota `POST /ai/generate-lesson-plan` que recebe a disciplina e o ano/turma, instruindo via prompt de sistema a criação de um plano de aula pedagógico estruturado em formato Markdown.
> 2. Crie também o endpoint `POST /ai/generate-parent-report` que recebe os dados de notas e frequência de um aluno em risco crítico e gera uma carta acolhedora, formal e assertiva direcionada aos responsáveis.
> 3. No frontend do Professor (na aba de aulas), insira o botão 'Gerar Plano de Aula com IA' que submete a requisição e exibe o Markdown formatado na tela com transição suave.
>
> No painel da Secretaria, ao lado do nome dos alunos listados no Risco Crítico, insira o botão 'Gerar Notificação para os Pais via IA' exibindo o texto pronto para cópia."

---

### 🔹 BLOCO 4: ANTICRASH DE DEMO E HIGIENE DO CÓDIGO (DIAS 6-7)

#### PROMPT 09: Tratamento Anti-404, Remoção de Mocks e Build Clean

> **Contexto:** Alvo: `src/lib/nav-config.ts`, sidebars e dashboards principais.
>
> **Prompt:** "Realize o polimento de segurança e consistência para a apresentação final do projeto:
>
> 1. Analise o arquivo `src/lib/nav-config.ts` e a renderização da Sidebar. Comente ou remova temporariamente quaisquer links ou submenus que apontem para páginas que não foram implementadas nesta sprint (como chats privados ou relatórios financeiros complexos), blindando a navegação contra erros 404 durante a demo do evento.
> 2. Verifique os três painéis principais (Secretaria, Professor, Aluno) e certifique-se de que nenhum indicador numérico permaneceu fixado de forma estática (hardcoded). Todos os KPIs (total de alunos, professores, turmas, tarefas pendentes) devem originar-se de requisições reais.
> 3. Garanta que o tratamento de erro em componentes React capture falhas de requisição graciosamente sem quebrar a tela do usuário."

---

## 🏁 5. Roteiro Ideal da Apresentação (Pitch do Evento)

Para garantir que o código apoie a narrativa de vitória, o sistema deve permitir o seguinte fluxo contínuo de 5 minutos:

1. **Abertura (Secretaria):** Login e exibição imediata do gráfico de rosca do **"Índice de Risco de Evasão/Reprovação"** alimentado em tempo real por dados analíticos das notas e faltas dos alunos.

2. **Agilidade (UX Premium):** Pressionar `Cmd + K` para abrir o menu suspenso global e saltar direto para o perfil do **Professor**.

3. **Produtividade (Professor):** O professor abre a turma do _9º Ano A_, clica em **"Gerar Plano de Aula com IA"** para economizar tempo burocrático. Em seguida, registra uma falta e lança uma nota vermelha para um aluno de teste.

4. **Transparência (Aluno):** Login instantâneo no painel do Aluno, visualizando em tempo real a nota baixa lançada no boletim e a alteração gráfica em sua barra de frequência.

5. **Tomada de Decisão (Secretaria):** Retorno à Secretaria. O painel atualizou sozinho: o aluno foi movido para a zona de **"Risco Crítico"**. O gestor clica no aluno e usa a IA para gerar a carta de notificação/acolhimento perfeita para os pais.
