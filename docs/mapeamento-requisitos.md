# ClassOn — Mapeamento de Requisitos (CPS/ETEC)

> Fonte da verdade do projeto. Tudo que entrar aqui deve ter evidência: print/vídeo do NSA ou confirmação da equipe (secretaria/direção).

## 0) Objetivo do Sistema

- Problema que resolve:
- Público-alvo (roles):
- Escopo do MVP:
- Fora de escopo (por enquanto):

## 1) Glossário CPS/ETEC (Dicionário de Termos)

> Definições oficiais usadas no projeto (evita ambiguidade)

- ETEC:
- Curso:
- Turma:
- Série / Módulo / Semestre:
- Ano letivo:
- Período (bimestre/semestre):
- Disciplina:
- Atribuição docente:
- Diário de classe:
- Matrícula:
- Rematrícula:
- Transferência:
- Trancamento:
- Fechamento:
- Recuperação:
- Dependência:
- Conselho:
- (adicione conforme descobrir)

## 2) Perfis (Roles) e Responsabilidades

> O que cada papel faz e o que NÃO faz

### 2.1 Aluno

- Objetivos:
- Telas que acessa:
- Ações permitidas:
- Restrições:

### 2.2 Responsável

- Objetivos:
- Telas que acessa:
- Ações permitidas:
- Restrições:

### 2.3 Professor

- Objetivos:
- Telas que acessa:
- Ações permitidas:
- Restrições:

### 2.4 Secretaria

- Objetivos:
- Telas que acessa:
- Ações permitidas:
- Restrições:

### 2.5 Coordenação / Direção

- Objetivos:
- Telas que acessa:
- Ações permitidas:
- Restrições:

## 3) Multi-tenant (ETEC)

- Como o usuário escolhe a ETEC no login:
- Um usuário pode pertencer a mais de uma ETEC? (sim/não/depende)
- Como funciona troca de ETEC dentro do sistema:
- Regras de isolamento de dados (o que nunca pode vazar):

## 4) Mapa do Sistema (Sitemap)

> Lista de módulos e telas (mesmo que ainda seja rascunho)

- Auth/Login
- Aluno
- Responsável
- Professor
- Secretaria/Admin
- Relatórios
- Configurações

---

# 5) Fluxos (o coração do sistema)

> Cada fluxo deve ter evidências e edge cases. Se não tiver certeza, marcar como HIPÓTESE.

## Template — Fluxo

### [FLUXO_ID] Nome do fluxo

**Status:** Rascunho | Em validação | Validado  
**Atores:** (ex.: Secretaria, Aluno)  
**Evidências:** (links/paths para prints/vídeos)

#### 5.1 Objetivo

- O que esse fluxo resolve?

#### 5.2 Pré-condições

- O que precisa existir antes?

#### 5.3 Passo a passo (como é feito hoje no NSA)

1. ...
2. ...

#### 5.4 Entradas e Saídas (dados)

**Entradas (dados informados/selecionados):**

- Campo:
- Campo:

**Saídas (o que muda no sistema):**

- Cria/atualiza:
- Gera documento/relatório:
- Muda status de:

#### 5.5 Regras de negócio (invariantes)

- Regra 1:
- Regra 2:
  > Marcar como HIPÓTESE se não estiver confirmado.

#### 5.6 Estados (State machine)

> Quais estados esse processo/entidade pode ter?

- Estado A -> Estado B (quando?)
- Estado B -> Estado C (quando?)
- Quem pode mudar estado?

#### 5.7 Permissões e Escopo

- Quem pode ver?
- Quem pode criar/editar/cancelar?
- Existe período de bloqueio (ex.: após fechamento)?

#### 5.8 Edge cases (o que acontece se…)

- E se o aluno transferir no meio do período?
- E se a turma lotar?
- E se lançar nota depois do fechamento?
- E se faltar dado obrigatório?
- E se o usuário tentar alterar algo de outro ano letivo?

#### 5.9 Relatórios / Saídas oficiais

- Quais relatórios esse fluxo alimenta?

#### 5.10 Entidades impactadas (rascunho)

> Lista inicial para ajudar na modelagem do banco

- Prováveis entidades:
- Relacionamentos:
- Campos críticos:

---

# 6) Telas (Referência Visual)

> Não é pra desenhar tudo perfeito. Aqui é para linkar o que existe e registrar comportamento.

## Template — Tela

### [TELA_ID] Nome da tela

**Role:**  
**Evidências:** (prints/vídeos)  
**Objetivo:**

#### 6.1 Componentes e Seções

- Campos:
- Botões:
- Tabelas/listas:
- Filtros:

#### 6.2 Ações (o que cada botão faz)

- Botão "Salvar": ...
- Botão "Confirmar": ...
- Botão "Cancelar": ...
- Ação "Exportar": ...

#### 6.3 Validações e Mensagens

- Validação:
- Mensagem de erro:
- Mensagem de sucesso:

#### 6.4 Regras/Observações

- Observação importante:
- HIPÓTESE:

---

# 7) Relatórios (obrigatórios e desejáveis)

- Relatório 1: quem usa, quando, dados necessários
- Relatório 2:

---

# 8) Decisões de Arquitetura (ADR)

> Decisões importantes com justificativa (evita reabrir discussão)

## [ADR-001] Multi-tenant por tenant_id + RLS

- Decisão:
- Motivo:
- Consequências:

## [ADR-002] Modelo normalizado + views de leitura

- Decisão:
- Motivo:
- Consequências:

---

# 9) Pendências / Dúvidas para próxima reunião

- Dúvida 1:
- Dúvida 2:
