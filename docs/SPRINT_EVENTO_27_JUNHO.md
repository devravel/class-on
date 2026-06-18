# 🎯 CLASSON — DIRETRIZ OFICIAL DA SPRINT (APRESENTAÇÃO EM 27 DE JUNHO)

## 📌 Objetivo Estratégico da Sprint

Preparar o ClassOn para vencer o evento de tecnologia no dia 27 de Junho.
O objetivo **NÃO** é concluir um ERP escolar tradicional e massivo. O objetivo é demonstrar um **Ecossistema Inteligente Conectado End-to-End (Secretaria → Professor → Aluno)**, onde as ações operacionais alimentam recursos preditivos e automações com Inteligência Artificial Generativa em tempo real.

---

## 🛠️ Status Técnico & Arquitetura Alvo

### Stack Tecnológica Fixa

- **Backend:** NestJS 10, Prisma 7, PostgreSQL (Docker), JWT, RBAC via Guards.
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, FullCalendar, Recharts/Tremor.

### Regra de Ouro para o Cursor AI

> 🚫 **NÃO remodele as entidades existentes no `schema.prisma`.** O banco já possui toda a estrutura necessária (`users`, `students`, `teachers`, `classes`, `grades`, `lessons`, `attendance`, `tasks`, `events`, `announcements`, etc.). Escreva a lógica de negócios e as queries adaptando-se estritamente ao schema atual.

---

## 📅 Roteiro de Execução por Fases (Foco em Menor Retrabalho)

### FASE 0: Desbloqueio da Infraestrutura Crítica (Backend Core)

Antes de construir novas interfaces, o Cursor AI deve resolver os bugs estruturais que causam falhas de integração e erros 500:

1. **Enriquecimento do JWT (`jwt.strategy.ts`):** Modificar o método `validate` para buscar o usuário no banco via Prisma incluindo os relacionamentos `.teacher` ou `.student` baseado na `role`. Injetar esses dados estruturados no objeto `req.user` para que os controllers acadêmicos localizem imediatamente `req.user.teacher.id` ou `req.user.student.id`.
2. **Reordenação de Rotas Rest no NestJS:** No `assignments.controller.ts` e `tasks.controller.ts`, mover as rotas coringas/genéricas (ex: `GET /:id`) para o **final absoluto** do arquivo, impedindo o sequestro de rotas específicas como `GET /teacher/:id` e `GET /student/me`.
3. **Automação de Bimestres:** No serviço de criação de Anos Letivos (`academic-years.service.ts`), injetar um gatilho via transação do Prisma para criar automaticamente os 4 bimestres padrão (B1, B2, B3, B4) sempre que um novo ano letivo for aberto pela secretaria.
4. **Script de Seed Avançado para Demo (`seed.ts`):** Atualizar o seed para gerar uma massa de dados perfeitamente relacionada para a apresentação: 1 ano ativo (2026), 4 bimestres, 2 disciplinas (Matemática e Português), 1 turma (9º Ano A), 1 professor real e 5 alunos reais vinculados aos usuários de teste (com senhas descriptografadas ou padronizadas no ambiente de desenvolvimento).

---

### FASE 1: O Primeiro Wow Factor — Interface de Produtividade Moderna

Aprimorar a experiência do usuário (UX) transformando o sistema burocrático em uma plataforma ágil e fluida.

- **Barra de Comando Inteligente (`Cmd + K` / `Ctrl + K`):**
  - **Frontend:** Implementar um componente flutuante global no Next.js (utilizando `cmdk` ou Tailwind nativo) que escuta o atalho de teclado.
  - **Funcionalidade:** Permitir navegação instantânea por comandos (Ex: digitar "Lançar Notas" redireciona para a área do professor; digitar "Ver Boletim" vai para a área do aluno). Adicionar atalhos estáticos para os perfis da Demo e busca rápida simulada de alunos contidos no Seed.

---

### FASE 2: Unificação da Área do Professor & Fechamento do Fluxo Acadêmico

Em vez de pulverizar o desenvolvimento em múltiplas páginas separadas gerando links quebrados, o foco é construir uma **Página Centralizada de Gestão de Turma** em `src/app/professor/turmas/[id]/page.tsx`.

1. **Aba "Diário de Classe" (Chamada & Aulas):**
   - Interface para listar os alunos da turma selecionada com botões rápidos de Presença/Ausência.
   - Consumir os módulos backend de `lessons` e `attendance` para persistir os dados reais.
2. **Aba "Lançamento de Notas":**
   - Tabela com os inputs para notas estruturadas (N1, N2, N3, N4), cálculo automático de média em tempo real no client/server e campo para nota de recuperação (`recovery_grade`). Nota de corte: 6.0.
   - Consumir o módulo backend de `grades`.
3. **Aba "Tarefas Rápidas":**
   - Formulário simplificado para o professor criar tarefas com prazo, integrando com o backend de `tasks`.

---

### FASE 3: O Segundo Wow Factor — IA Contextual Preditiva (Análise de Risco)

Transformar o ClassOn em uma plataforma de tomada de decisão, eliminando gráficos com dados estáticos ou puramente mockados na Secretaria e no Professor.

- **Heurística de Risco de Evasão/Reprovação:**
  - **Backend:** Criar o endpoint `GET /dashboard/analytics/risk` no NestJS. Ele fará uma varredura analítica nos dados de faltas e notas dos alunos matriculados usando uma lógica ponderada de pesos:
    - Média de Notas < 6.0 = +40 pontos de risco.
    - Frequência de Faltas > 25% (Presença < 75%) = +50 pontos de risco.
    - Frequência de Faltas entre 15% e 25% = +20 pontos de risco.
    - _Score Total > 60_ $\rightarrow$ Aluno categorizado como **"Risco Crítico"**.
  - **Frontend:** Plotar um gráfico de rosca/pizza altamente visual (usando `Recharts` ou `Tremor`) nos painéis da Secretaria e do Professor. Clicar no segmento crítico exibe o nome do aluno afetado.
  - **Efeito na Demo:** Ao lançar uma nota vermelha ou uma falta na tela do Professor, o gráfico de risco no painel da Secretaria deve reagir e atualizar os dados dinamicamente.

---

### FASE 4: O Terceiro Wow Factor — IA Generativa Contextual (`Copiloto ClassOn`)

Adicionar inteligência artificial nativa integrada à rotina escolar usando chamadas de API externas rápidas (OpenAI GPT-4o-mini ou Groq Llama 3) via variáveis de ambiente.

1. **Gerador de Planos de Aula (Foco: Professor):**
   - Na página da Turma do Professor, incluir um botão destacado: **"Gerar Plano de Aula com IA"**.
   - O backend coleta a disciplina e a turma atuais, envia um prompt estruturado para a LLM e retorna um cronograma pedagógico detalhado formatado em Markdown, renderizado de forma elegante na tela do professor.
2. **Gerador de Feedback para os Pais (Foco: Secretaria/Coordenação):**
   - Ao inspecionar um aluno em "Risco Crítico" no painel da secretaria, adicionar o botão **"Gerar Relatório de Acolhimento por IA"**.
   - O sistema extrai o histórico de notas e faltas do banco via Prisma, envia à LLM e gera uma carta/e-mail personalizada, empática e formal direcionada aos responsáveis pelo aluno, sugerindo planos de melhoria.

---

### FASE 5: Consumo do Aluno, Polimento Visual e Esconderijo Técnico

- **Visão do Aluno:** Ativar a página `/aluno/boletim` consumindo os endpoints reais de `grades/my-grades` e `attendance` para exibir as notas reais lançadas pelo professor e o gráfico de barra de progresso de sua frequência.
- **Ocultação de Ruídos (Anticrash de Demo):**
  - Desabilitar ou comentar temporariamente na Sidebar todos os links de funcionalidades não contempladas nesta sprint (como mensagens privadas e relatórios analíticos complexos) para evitar erros 404 visíveis durante a apresentação.
  - Garantir tratamento de erros amigável nos componentes do React 19 para evitar telas brancas se alguma requisição falhar.

---

## 🏆 Roteiro de Fluxo Ideal para a Apresentação (Pitch do Evento)

O Cursor AI deve certificar-se de que o código final permite executar perfeitamente este roteiro linear de 5 minutos:

1.  **Abertura (0-1 min):** Login na **Secretaria**. Apresentação do painel de controle dinâmico com o gráfico de rosca do **"Índice de Risco de Evasão/Reprovação"** calculado em tempo real com base no comportamento dos alunos.
2.  **Agilidade (1-2 min):** Uso da barra de comandos `Cmd + K` para saltar instantaneamente para a listagem de turmas. Troca de perfil rápida para o **Professor**.
3.  **Produtividade com IA (2-3 min):** Professor acessa o _9º Ano A_, clica em **"Gerar Plano de Aula com IA"** para poupar tempo burocrático. Em seguida, realiza a chamada daquela aula e lança uma nota baixa para um aluno de teste.
4.  **Fechamento do Ecossistema (3-4 min):** Login com o perfil do **Aluno** testado. Mostra-se o painel atualizado instantaneamente com a nota vermelha e a alteração na sua frequência.
5.  **Tomada de Decisão (4-5 min):** Retorno à **Secretaria**. O gráfico de risco mudou de cor automaticamente, movendo o aluno para a zona de risco crítico. O gestor clica no aluno e usa a IA para gerar a carta de notificação aos pais.

---

## 🚨 Regras de Implementação para o Assistente AI

1. Reutilize integralmente os padrões estéticos baseados em Tailwind CSS presentes nos arquivos da pasta `src/app/secretaria/`.
2. Mantenha os decorators de proteção `@Roles(Role.TEACHER)` e `@Roles(Role.ADMIN)` do NestJS ativos e funcionais.
3. Não utilize dados estáticos codificados no frontend (_hardcoded_) nas telas principais da demo; force o consumo dos endpoints criados para evidenciar a integração real das camadas.
