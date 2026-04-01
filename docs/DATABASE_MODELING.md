# 📘 DATABASE MODELING — ClassOn

---

## 🎯 Objetivo do Documento

Este documento define a modelagem oficial do banco de dados do **ClassOn**.

Ele funciona como a **fonte central de verdade da camada de dados**, mantendo alinhamento entre:

- DrawSQL
- DER
- SQL principal
- Prisma Schema
- Backend (NestJS)
- Regras do domínio acadêmico

Este arquivo documenta:

- entidades
- relacionamentos
- cardinalidade
- enums
- constraints
- índices
- soft delete
- histórico acadêmico
- tabelas pivô
- regras críticas de integridade

---

# 👤 users

Tabela base de autenticação e RBAC.

## Campos
- `id` (PK)
- `email` (UNIQUE)
- `password`
- `role`
- `is_active`
- `created_at`

## Enum
`role`
- SECRETARIA
- PROFESSOR
- ALUNO

## Regras
- centraliza login do sistema
- perfis acadêmicos ficam separados
- base para autenticação JWT
- `email` é único globalmente

## Relacionamentos
- 1:1 com `students`
- 1:1 com `teachers`
- 1:N com `announcements`
- 1:N com `messages`

---

# 👨‍🎓 students

Perfil acadêmico do aluno.

## Campos
- `id`
- `user_id` (FK → users)
- `rm` (UNIQUE)
- `full_name`
- `status`

## Enum
`status`
- ACTIVE
- INACTIVE

## Regras
- RM é login acadêmico
- soft delete via `status`
- histórico preservado
- nunca excluir fisicamente

## Relacionamentos
- 1:1 com `users`
- 1:N com `enrollments`
- 1:N com `attendances`
- 1:N com `task_submissions`
- 1:N com `task_targets`
- 1:N com `conversations`
- 1:N com `announcement_targets`

---

# 👨‍🏫 teachers

Perfil acadêmico do professor.

## Campos
- `id`
- `user_id`
- `full_name`
- `registration_code`

## Constraints
- `registration_code` UNIQUE
- `user_id` UNIQUE

## Relacionamentos
- 1:1 com `users`
- 1:N com `assignments`
- 1:N com `conversations`

---

# 🏫 classes

Representa a turma por ano letivo.

## Campos
- `id`
- `year_id`
- `series`
- `letter`
- `shift`

## Cardinalidade
- N:1 com `academic_years`

## UNIQUE importante
```text
(year_id, series, letter, shift)
```

## Regra
Impede duplicidade como:

- 1º A manhã 2026
- 1º A manhã 2026 ❌

## Relacionamentos
- 1:N com `enrollments`
- 1:N com `assignments`
- 1:N com `announcement_targets`

---

# 📚 subjects

Catálogo global de disciplinas.

## Campos
- `id`
- `name`
- `description`

## Regras
- disciplina é reutilizável
- não pertence diretamente à turma
- conexão ocorre por `assignments`

## Relacionamentos
- 1:N com `assignments`

---

# 📌 assignments

Tabela pivô tripla:

`teacher ↔ class ↔ subject`

## Campos
- `teacher_id`
- `class_id`
- `subject_id`

## Cardinalidade
- teacher 1:N assignments
- class 1:N assignments
- subject 1:N assignments

## UNIQUE crítico
```text
(teacher_id, class_id, subject_id)
```

## Objetivo
- RBAC do professor
- define quais turmas ele pode acessar
- define disciplina da turma

---

# 📝 enrollments

Tabela pivô histórica:

`student ↔ class`

## Campos
- `student_id`
- `class_id`
- `final_result`
- `created_at`

## Enum
- PENDING
- APPROVED
- REPROVED
- COMPLETED

## UNIQUE crítico
```text
(student_id, class_id)
```

## Objetivo
- histórico escolar
- progressão anual
- preservação de vínculo por ano

---

# 📊 grades

Notas por bimestre.

## Campos
- `enrollment_id`
- `assignment_id`
- `bimester_id`
- `n1`
- `n2`
- `n3`
- `n4`
- `average`

## UNIQUE crítico
```text
(enrollment_id, assignment_id, bimester_id)
```

## Regras
- 1 nota por aluno + disciplina + bimestre
- backend valida bimestre aberto
- média pode ser persistida ou calculada

---

# 📅 lessons

Aula real executada.

## Campos
- `assignment_id`
- `date`
- `lesson_order`
- `content`

## Regras
- representa aula ministrada
- base da frequência
- pode ser usada por IA futura

---

# ✅ attendances

Presença por aula.

## Campos
- `student_id`
- `lesson_id`
- `status`

## Enum
- PRESENT
- ABSENT

## UNIQUE crítico
```text
(student_id, lesson_id)
```

## Regra
Impede duplicidade de chamada.

---

# 📌 tasks

Tarefas por disciplina.

## Campos
- `assignment_id`
- `title`
- `description`
- `status`
- `target_mode`

## Enums
`status`
- OPEN
- CLOSED

`target_mode`
- CLASS
- SPECIFIC_STUDENTS

## Relacionamentos
- 1:N com `task_targets`
- 1:N com `task_submissions`

---

# 🎯 task_targets

Pivô de alunos específicos da tarefa.

## Campos
- `task_id`
- `student_id`

## UNIQUE
```text
(task_id, student_id)
```

## Uso
Só existe quando tarefa é individualizada.

---

# 📥 task_submissions

Entrega do aluno.

## Campos
- `task_id`
- `student_id`
- `status`
- `observation`
- `submitted_at`

## Enum
- PENDING
- SUBMITTED

## UNIQUE
```text
(task_id, student_id)
```

---

# 📢 announcements

Comunicados gerais.

## Regras do domínio

### Secretaria pode
- todos os alunos
- todos os professores
- todo o sistema
- turmas específicas
- alunos específicos
- misto

### Professor pode
- alunos das próprias turmas
- turmas específicas
- alunos específicos

### Aluno
- não cria comunicados

## Campos
- `creator_id`
- `title`
- `message`
- `status`
- `scope_type`
- `target_type`

---

# 🎯 announcement_targets

Define o alvo do comunicado.

## Campos
- `announcement_id`
- `class_id` (nullable)
- `student_id` (nullable)

## Uso
Permite cenários como:

- turma inteira
- várias turmas
- alunos específicos
- mistura entre turmas e alunos

---

# 👀 announcement_reads

Controle de leitura.

## UNIQUE
```text
(announcement_id, user_id)
```

## Objetivo
- saber quem leu
- auditoria
- futura IA de engajamento

---

# 💬 conversations

Canal privado aluno ↔ professor.

## UNIQUE obrigatório
```text
(student_id, teacher_id)
```

## Regra
- só 1 conversa por dupla
- histórico preservado

---

# 📨 messages

Mensagens da conversa.

## Campos
- `conversation_id`
- `sender_id`
- `content`
- `status`

## Enum
- SENT
- READ

---

# 🧠 Estratégias Estruturais

## Soft Delete
Aplicado em:

- `students`

Via:

```text
status = ACTIVE | INACTIVE
```

---

## Histórico Acadêmico
Garantido por:

- `enrollments`
- novas turmas por ano
- sem sobrescrever registros

---

## Tabelas Pivô Oficiais
- `assignments`
- `enrollments`
- `task_targets`
- `announcement_targets`

---

## Índices Mais Importantes
- `users.email`
- `students.rm`
- `classes(year_id, series, letter, shift)`
- `enrollments(student_id, class_id)`
- `grades(enrollment_id, assignment_id, bimester_id)`
- `conversations(student_id, teacher_id)`