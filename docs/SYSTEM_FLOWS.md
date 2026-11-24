# 📘 ClassOn — DOCUMENTO DE FLUXOS DO SISTEMA (VERSÃO PARA MODELAGEM DE BANCO)

---

## 📌 PADRÃO DOS FLUXOS

Cada fluxo descreve:

- Quem faz  
- O que faz  
- Dados informados  
- O que acontece depois  
- Quem pode editar  
- Exclusão  
- Histórico  
- Validação / fechamento  
- Exceções  

---

# 🔐 BLOCO 1 — PERFIS DE ACESSO

## Secretaria

Quem faz: Usuário com perfil SECRETARIA  

O que faz:
- Acesso total ao sistema

Permissões:
- Criar, editar e excluir turmas  
- Criar, editar e excluir alunos  
- Criar, editar e excluir professores  
- Gerenciar disciplinas  
- Controlar bimestres  
- Encerrar turmas  
- Definir resultado final  

---

## Professor

Quem faz: Usuário com perfil PROFESSOR  

O que faz:
- Atua apenas nas turmas atribuídas

Permissões:
- Visualizar turmas  
- Lançar notas  
- Editar notas  
- Registrar presença  
- Criar tarefas  
- Criar comunicados  
- Responder conversas privadas  

---

## Aluno

Quem faz: Usuário com perfil ALUNO  

O que faz:
- Acesso apenas aos próprios dados

Permissões:
- Visualizar notas  
- Visualizar turma  
- Visualizar frequência  
- Visualizar tarefas  
- Entregar tarefas  
- Visualizar comunicados  
- Conversar com professores  
- Editar dados pessoais  
- Alterar senha  

---

## Autenticação

Aluno:
- login: RM  
- senha provisória obrigatória  

Professor:
- login definido pela secretaria  
- senha provisória  

Secretaria:
- login administrativo  

---

# 🏫 BLOCO 2 — TURMAS

## Criação de turma

Quem faz: Secretaria  

O que faz:
- Cria uma nova turma

Dados informados:
- série  
- letra  
- turno  
- ano letivo  
- quantidade de alunos (1º ano)

O que acontece depois:
- 1º ano: alunos são gerados automaticamente  
- 2º e 3º ano: exige importação da turma anterior  

Quem pode editar:
- Secretaria  

Exclusão:
- Permitida com confirmação  

Histórico:
- Turmas não são apagadas  

Validação:
- Verificar duplicidade (série + letra + turno + ano)

Exceções:
- Não permitir criação duplicada  

---

## Progressão de turma

Quem faz: Secretaria  

O que faz:
- Cria nova turma e importa alunos aprovados  

Regras:
- Apenas alunos APROVADOS são promovidos  

---

# 👨‍🎓 BLOCO 3 — ALUNOS

## Criação automática

Quem faz: Sistema  

O que faz:
- Gera alunos ao criar turma  

Dados:
- RM  
- nome provisório  
- senha provisória  
- turma  

---

## Criação manual

Quem faz: Secretaria  

O que faz:
- Adiciona aluno manualmente  

---

## Edição

Quem pode editar:
- Secretaria (total)  
- Aluno (parcial)  

Validação:
- Ações críticas exigem confirmação  

---

## Exclusão

Tipo:
- Soft delete  

Regras:
- status: ACTIVE → INACTIVE  

---

## Histórico

- Aluno mantém todas as turmas  

---

# 👨‍🏫 BLOCO 4 — PROFESSORES E DISCIPLINAS

## Disciplinas

- Entidade global  
- Reutilizável  

---

## Configuração na turma

Quem faz: Secretaria  

O que faz:
- Define disciplinas da turma  

---

## Atribuição

Quem faz: Secretaria  

Relacionamento:
- Professor ↔ Turma ↔ Disciplina  

Validação:
- Cada disciplina deve ter professor  

---

# 📊 BLOCO 5 — BIMESTRES

Quem faz: Secretaria  

O que faz:
- Controla bimestres  

Ações:
- Abrir  
- Fechar  

Regras:
- Controle manual  

---

# 📝 BLOCO 6 — NOTAS

## Lançamento

Quem faz: Professor  

O que faz:
- Lança notas por aluno  

Dados:
- notas  
- bimestre  

O que acontece depois:
- sistema calcula média  

Edição:
- Apenas se bimestre ABERTO  

Exceções:
- Bimestre FECHADO bloqueia edição  

---

# 📅 BLOCO 7 — HORÁRIOS E FREQUÊNCIA

## Horários

- Grade semanal fixa  

Dados:
- dia da semana  
- ordem  
- atribuição  

---

## Aula

Quem faz: Professor  

O que faz:
- Cria aula real  

Dados:
- turma  
- disciplina  
- data  
- ordem  

---

## Presença

Quem faz: Professor  

O que faz:
- Marca presença  

Dados:
- aluno  
- aula  
- status  

Regras:
- Um registro por aluno por aula  

---

## Frequência

Cálculo:
frequência = presenças / total de aulas  

---

# 📌 BLOCO 8 — TAREFAS

## Criação

Quem faz: Professor  

O que faz:
- Cria tarefa  

Dados:
- turma  
- disciplina  
- título  
- descrição  
- destinatários  
- status  

---

## Entrega

Quem faz: Aluno  

O que faz:
- Marca como entregue  

Dados:
- status  
- observação  

---

## Controle

Quem faz: Professor  

Regras:
- ABERTA → permite entrega  
- FECHADA → bloqueia  

---

## Acompanhamento

Professor visualiza:
- status por aluno  

---

## Histórico

- Mantido  

---

# 📌 BLOCO 9 — MENSAGENS

## Comunicados

Quem faz:
- Secretaria  
- Professor  

Dados:
- título  
- mensagem  
- destinatários  
- status  

---

## Leitura

- Registro por usuário  

---

## Conversas privadas

Quem faz:
- Aluno ↔ Professor  

Regras:
- Apenas professores da turma  

Funcionamento:
- Assíncrono  

---

# 🖥️ BLOCO 10 — DASHBOARD

## Secretaria
- visão geral  

## Professor
- turmas e tarefas  

## Aluno
- dados pessoais e acadêmicos  

---

# 🔒 BLOCO 11 — RBAC

Perfis:
- SECRETARIA  
- PROFESSOR  
- ALUNO  

Regras:
- controle de acesso total  

---

# 🔗 BLOCO 12 — RELACIONAMENTOS PRINCIPAIS

- Aluno → Turma  
- Professor → Turma (via atribuição)  
- Disciplina → Turma (via atribuição)  
- Nota → Aluno + Turma + Disciplina + Bimestre  
- Aula → Turma + Disciplina + Professor  
- Presença → Aluno + Aula  
- Tarefa → Turma + Disciplina + Professor  
- Entrega → Aluno + Tarefa  
- Comunicado → múltiplos destinatários  
- Conversa → Aluno ↔ Professor  

---

# 🧾 BLOCO 13 — ENUMS

Valores como estão gravados no banco. Perfis e bimestre ficaram em português;
o resto do código usa inglês. É uma inconsistência conhecida, mantida de
propósito: renomear exige migration de dados e não muda nada pro usuário.

Perfis (`users.role`):
- SECRETARIA  
- PROFESSOR  
- ALUNO  

Ano letivo (`academic_years.status`):
- ACTIVE  
- CLOSED  

Bimestre (`bimesters.status`):
- ABERTO  
- FECHADO  

Tarefa (`tasks.status`):
- OPEN  
- CLOSED  

Entrega (`task_submissions.status`):
- SUBMITTED  
- LATE (entregue depois do prazo)  
- PENDING não é gravado: a API devolve quando o aluno ainda não entregou  

Presença (`attendances.status`):
- PRESENT  
- ABSENT  

Comunicado (`announcements.status`):
- ACTIVE  
- ARCHIVED  

Leitura:
- não há status; a leitura é uma linha em `announcement_reads` com `read_at`  

Evento (`events.status`, enum `EventStatus` no Prisma):
- ACTIVE  
- CANCELLED  

Público de evento (`events.scope_type`, enum `EventScopeType`):
- ALL_SCHOOL  
- TEACHERS  
- STUDENTS  
- SPECIFIC_CLASSES  

Aluno (`students.status`):
- ACTIVE  
- INACTIVE  
- TRANSFERRED  
- GRADUATED  

Resultado final (calculado, não gravado):
- APROVADO (média final ≥ 6,0)  
- REPROVADO  

Turma e usuário não têm status: usam `is_active` (boolean).  

---

# 🎯 OBJETIVO DO DOCUMENTO

Base para:

- Modelagem de banco  
- DER  
- Prisma  
- Backend  
- Frontend  
- IA futura  