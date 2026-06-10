# CLASSON — CONTEXTO OFICIAL DA SPRINT (APRESENTAÇÃO DIA 27)

## Objetivo da Sprint

Preparar o ClassOn para demonstração pública em evento de tecnologia.

O objetivo NÃO é concluir todo o ERP escolar.

O objetivo é demonstrar uma plataforma funcional de gestão acadêmica com fluxo real entre Secretaria, Professor e Aluno, servindo de base para futuras funcionalidades de Inteligência Artificial.

---

# Estado Atual do Projeto

## Backend

Stack:

- NestJS
- Prisma ORM
- PostgreSQL
- JWT
- RBAC

Módulos já existentes:

- auth
- academic-years
- classes
- prisma

Já implementado:

- Login
- Autenticação JWT
- Controle de acesso por perfil
- Anos Letivos
- Turmas
- Arquitetura modular

---

## Banco de Dados

O banco já possui modelagem para:

- users
- students
- teachers
- academic_years
- bimesters
- classes
- subjects
- assignments
- enrollments
- grades
- lessons
- attendance
- tasks
- task_targets
- task_submissions
- announcements
- announcement_reads
- announcement_targets
- conversations
- messages

IMPORTANTE:

Não remodelar entidades já existentes sem necessidade.

A prioridade é implementar funcionalidades utilizando a modelagem atual.

---

# Perfis do Sistema

## Secretaria

Responsável pela administração escolar.

Deve conseguir:

- Criar anos letivos
- Criar bimestres
- Criar professores
- Criar alunos
- Criar alunos em lote
- Criar disciplinas
- Criar turmas
- Matricular alunos
- Associar disciplinas à turma
- Associar professores às disciplinas
- Enviar comunicados

---

## Professor

Responsável pela gestão acadêmica das turmas atribuídas.

Deve conseguir:

- Visualizar suas turmas
- Realizar chamada
- Lançar notas
- Adicionar recuperação
- Criar tarefas
- Corrigir entregas
- Criar eventos acadêmicos
- Publicar comunicados

---

## Aluno

Responsável apenas por consultar e responder informações.

Deve conseguir:

- Visualizar notas
- Visualizar frequência
- Visualizar tarefas
- Enviar respostas
- Visualizar comunicados
- Visualizar calendário

---

# Escopo Oficial da Apresentação

## Módulo 1 — Professores

CRUD completo.

Funcionalidades:

- Listagem
- Cadastro
- Edição
- Ativar/Inativar

---

## Módulo 2 — Alunos

CRUD completo.

Funcionalidades:

- Cadastro individual
- Cadastro em lote
- Matrícula em turma

---

## Módulo 3 — Disciplinas

CRUD simples.

Exemplos:

- Matemática
- Português
- História
- Ciências

---

## Módulo 4 — Atribuições

Relacionamento:

Professor → Disciplina → Turma

Exemplo:

Professor João
↓
Matemática
↓
9º Ano A

Esse módulo é obrigatório porque libera:

- Notas
- Chamada
- Agenda
- Tarefas

---

## Módulo 5 — Chamada

Professor:

- Seleciona turma
- Seleciona aula
- Marca presença

Usar:

- lessons
- attendance

---

## Módulo 6 — Notas

Professor:

- Lança até 4 avaliações por bimestre

Campos:

- N1
- N2
- N3
- N4

Sistema:

- Calcula média automaticamente

Recuperação:

- recovery_grade

Nota mínima para aprovação:

- 6.0

---

## Módulo 7 — Tarefas

Professor:

- Cria tarefa
- Define prazo

Aluno:

- Responde texto
- Envia arquivos

Professor:

- Visualiza entregas

---

## Módulo 8 — Comunicados

Secretaria:

- Toda escola
- Apenas professores
- Apenas alunos

Professor:

- Turmas atribuídas

Aluno:

- Somente leitura

---

## Módulo 9 — Agendão Escolar

Biblioteca recomendada:

FullCalendar

Entidade:

calendar_events

Tipos:

- PROVA
- TRABALHO
- EVENTO
- AVISO

Secretaria:

- Visualiza todas as salas
- Cria eventos institucionais

Professor:

- Visualiza apenas turmas atribuídas
- Cria provas
- Cria trabalhos
- Cria eventos

Aluno:

- Apenas visualiza

---

# Diferencial Principal

Após todos os módulos acima estarem funcionais:

Implementar IA.

A IA será apresentada como:

"Assistente para automatizar processos da gestão escolar."

A IA NÃO é prioridade antes dos módulos acadêmicos funcionais.

---

# Regras para Implementação

Sempre seguir:

- Arquitetura modular existente
- Padrões de layout atuais
- RBAC existente
- Prisma existente
- Design System existente

Evitar:

- Criar novos padrões visuais
- Remodelar entidades sem necessidade
- Criar soluções temporárias que gerem retrabalho

Objetivo:

Demonstrar um sistema escolar funcional, consistente e escalável.
