# 📘 PROJECT CONTEXT — ClassOn

---

## 🎯 Visão do Projeto

O ClassOn é um sistema de gestão escolar voltado para o ensino médio, estruturado para atender turmas organizadas por série (1º, 2º e 3º ano), identificadas por letras (A, B, C, D) e turno.

O sistema tem como principal objetivo centralizar e organizar os processos acadêmicos essenciais da escola, proporcionando uma experiência mais eficiente, organizada e intuitiva para secretaria, professores e alunos.

O projeto possui dois pilares estratégicos:

- **Experiência do usuário moderna e intuitiva:** foco em um layout limpo, organizado e de fácil utilização, reduzindo complexidade operacional e melhorando a usabilidade no dia a dia escolar.

- **Base preparada para integração com Inteligência Artificial:** a arquitetura do sistema será planejada para permitir futuras funcionalidades com apoio de IA, como automações, recomendações e assistentes inteligentes, mesmo que essas integrações não estejam totalmente implementadas no MVP.

O ClassOn será desenvolvido como um projeto de TCC, com foco em demonstrar uma arquitetura bem estruturada, boas práticas de desenvolvimento e um sistema funcional e coerente, sem complexidade desnecessária.

Neste momento, o escopo está restrito ao ensino médio, não contemplando outros níveis de ensino ou estruturas educacionais mais complexas.

---

## 📌 Escopo do MVP

O sistema contemplará:

- autenticação de usuários (aluno, professor, secretaria)
- criação e gerenciamento de turmas
- geração automática de alunos no 1º ano
- cadastro e gerenciamento de professores
- configuração de disciplinas por turma
- atribuição de professores às disciplinas
- lançamento de notas por bimestre
- visualização de notas pelo aluno
- definição de resultado final do aluno
- encerramento de turma
- progressão de alunos para novas turmas
- controle manual de bimestres
- grade básica de horários por turma
- criação de aulas reais
- registro de presença por aula
- cálculo de frequência
- criação e entrega de tarefas
- comunicados institucionais
- conversas privadas assíncronas
- dashboard por perfil
- controle de acesso (RBAC) por rotas e permissões

---

## ❌ Fora do Escopo (por enquanto)

- integração com sistemas externos
- notificações em tempo real
- chat em tempo real (websocket)
- controle financeiro
- múltiplas unidades escolares
- aprovação automática por regra complexa
- recuperação paralela
- analytics avançado com IA
- múltiplos níveis de ensino

---

## 🧱 Stack Tecnológica

- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Backend:** NestJS
- **Frontend:** Next.js
- **Containerização:** Docker

---

## 🐳 Estratégia com Docker

Durante o desenvolvimento:

- Docker será utilizado **apenas para o banco de dados (PostgreSQL)**

Backend e frontend rodarão localmente sem container.

Na fase final (apresentação):

- todo o sistema poderá ser containerizado

---

## 🧠 Decisão de uso do Prisma

O Prisma será utilizado como ORM para:

- facilitar a modelagem do banco
- gerar migrations
- garantir tipagem forte no backend
- acelerar desenvolvimento

---

## 🧩 Estratégia de Desenvolvimento

O desenvolvimento seguirá abordagem por módulos:

1. Modelagem do banco (prioridade)
2. Validação das regras de negócio
3. Implementação do schema (Prisma)
4. Desenvolvimento backend por módulos
5. Desenvolvimento frontend por módulos

### Ordem sugerida:

1. Auth / usuários  
2. Turmas  
3. Alunos  
4. Professores  
5. Disciplinas  
6. Bimestres  
7. Notas  
8. Horários e frequência  
9. Tarefas  
10. Comunicados  
11. Conversas privadas  
12. Dashboard / RBAC  
13. Integrações futuras com IA  

---

## 👥 Perfis do Sistema

### Secretaria

- Acesso total ao sistema
- Gerencia:
  - turmas
  - alunos
  - professores
  - disciplinas
  - bimestres
- Define resultado final dos alunos
- Encerra turmas
- Realiza progressão

---

### Professor

- Acesso às turmas atribuídas
- Lança notas por disciplina
- Registra presença
- Cria aulas
- Cria e gerencia tarefas
- Cria comunicados
- Responde conversas privadas
- Visualiza alunos

---

### Aluno

- Acesso aos próprios dados
- Visualiza:
  - notas
  - disciplinas
  - turma
  - frequência
  - tarefas
  - comunicados
  - conversas privadas
- Pode entregar tarefas
- Pode alterar senha
- Pode editar dados pessoais (limitado)

---

## 🔐 Autenticação e Usuários

- Existe uma tabela separada de `usuarios`
- Entidades acadêmicas (`alunos`, `professores`) são separadas

### Login por perfil:

- **Aluno**
  - login: RM
  - senha provisória obrigatória no primeiro acesso

- **Professor**
  - login definido pela secretaria (ex: email ou padrão interno)

- **Secretaria**
  - login administrativo

---

## 🎓 Decisões sobre Alunos

- Alunos são gerados automaticamente ao criar turmas de 1º ano
- Cada aluno possui:
  - RM único
  - nome provisório
  - senha provisória
- Aluno está vinculado a uma turma
- RM é usado como login
- RM **não é chave primária**
- Existe `id` interno como PK

---

## 🏫 Decisões sobre Turmas

- Turmas representam uma combinação de:
  - série
  - letra
  - turno
  - ano letivo

Exemplo:

- 1º A - Manhã (2026)

### Regras:

- Turmas não são sobrescritas
- A cada ano, novas turmas são criadas
- Histórico é preservado

---

## 🔁 Progressão de Turmas

Existem dois fluxos:

### 1º ano

- alunos são gerados automaticamente

### 2º e 3º ano

- alunos são importados da turma anterior

Critério:

- apenas alunos com status `APROVADO`

---

## 📊 Notas

- Lançadas por professor
- Vinculadas a:
  - aluno
  - disciplina
  - turma
  - bimestre

### Estrutura:

- até 4 instrumentos de avaliação
- média bimestral calculada automaticamente

---

## 📅 Bimestres

- O sistema possui 4 bimestres fixos:
  - 1º, 2º, 3º, 4º

### Regras:

- não são amarrados a datas automáticas no MVP
- são controlados manualmente pela secretaria
- podem estar:
  - ABERTO
  - FECHADO

---

## 📅 Horários e Frequência

- Existe uma grade semanal por turma
- Professores criam aulas reais

### Presença:

- registrada por aula
- status:
  - PRESENTE
  - AUSENTE

### Cálculo:

- frequência (%) = presenças / total de aulas

---

## 📌 Tarefas

- Criadas por professores
- Vinculadas a turma e disciplina

### Regras:

- podem ser para turma inteira ou alunos específicos
- aluno marca como entregue
- professor controla status:
  - ABERTA
  - FECHADA

---

## 📢 Comunicação

### Comunicados

- enviados por secretaria ou professor
- múltiplos destinatários
- controle de leitura por usuário

### Conversas privadas

- aluno ↔ professor
- assíncrono (não real-time)
- histórico preservado

---

## 🧾 Resultado Final

- Definido pela secretaria
- Não depende automaticamente das notas

### Valores:

- APROVADO
- RETIDO
- CONCLUÍDO

---

## 🔒 Encerramento de Turma

- Realizado pela secretaria

### Regra:

- todos os alunos devem ter resultado final

---

## 📚 Histórico Acadêmico

- O aluno acumula turmas ao longo dos anos
- Não perde histórico
- Não muda de turma, cria novo vínculo

---

## ⚠️ Decisões Ainda em Aberto

- [ ] Estrutura detalhada de boletim e histórico exportável  
- [ ] Estratégia visual final dos dashboards  
- [ ] Módulos de IA do MVP de apresentação  
- [ ] Estrutura futura de relatórios gerenciais  

---

## 🚀 Objetivo Final

Construir um sistema:

- coerente  
- bem modelado  
- apresentável como TCC  
- com arquitetura próxima do mundo real  
- sem complexidade desnecessária  
- preparado para evolução com IA  