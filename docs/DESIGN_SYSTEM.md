# 🎨 DESIGN SYSTEM — ClassOn

---

## 🎯 Filosofia do Design

O ClassOn segue um padrão de interface:

- limpa e moderna
- foco em produtividade
- baixo ruído visual
- alto contraste e legibilidade
- padrão SaaS administrativo

A interface deve priorizar:

- clareza de informação
- rapidez de uso
- consistência visual
- hierarquia bem definida

---

## 🎨 Colors

### Brand (definido no Figma)

- primary: (definir HEX)
- primary-light: (definir)
- primary-dark: (definir)

---

### Neutrals

- gray-100
- gray-200
- gray-300
- gray-400
- gray-500
- gray-600
- gray-700
- gray-800
- gray-900

---

### Feedback / States

- success
- warning
- error
- info

---

### UI States

- hover
- focus
- active
- disabled

---

## 🔤 Typography

Font principal:

- Inter

### Escala tipográfica

- xs → 12px
- sm → 14px
- md → 16px
- lg → 18px
- xl → 20px
- 2xl → 24px
- 3xl → 32px

### Pesos

- regular → 400
- medium → 500
- semibold → 600
- bold → 700

---

## 📏 Spacing System

### Micro spacing

- 4px
- 8px
- 12px

### Default spacing

- 16px
- 24px

### Macro spacing

- 32px
- 40px
- 48px
- 64px

---

## 🧱 Grid & Layout

### Desktop

- 12 colunas
- max-width: 1200px ~ 1280px
- gutter: 24px

### Mobile / Tablet

- 4 colunas
- margin: 16px

---

## 🔲 Border Radius

- 8px → inputs, badges
- 12px → cards
- 16px → modais

---

## 🌫️ Shadows

- leve → cards
- média → modais
- none → estados flat

---

## 🧩 Iconografia

- biblioteca: Lucide (ou similar)
- estilo: outline
- tamanhos:
  - 16px → tabelas
  - 20px → botões
  - 24px → navegação

---

## 🖼️ Logo

Formato:

- SVG (principal)
- PNG (fallback)

Local:

- /public/assets/logo/

Variações:

- padrão
- branco
- ícone

Regras:

- não distorcer
- manter proporção
- respeitar espaçamento

---

## ⚙️ Stack de UI (OBRIGATÓRIO)

- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

---

## 🎨 Regras de Estilização

- usar apenas Tailwind
- não usar CSS puro
- não usar styled-components
- não usar valores hardcoded
- sempre utilizar tokens definidos

---

## 🧱 Layout Base

Estrutura padrão:

- Sidebar fixa (navegação principal)
- Header superior
- Área de conteúdo central
- Uso de containers e padding consistentes

---

## 📋 Padrão de Tabelas

Toda tabela deve conter:

- campo de busca
- filtros (quando necessário)
- ações por linha
- paginação
- estado vazio (empty state)
- estado de loading

---

## 📝 Padrão de Formulários

- labels acima dos campos
- validação clara
- mensagens de erro visíveis
- botão de ação no final
- uso de modal ou página dedicada

---

## 📊 Dashboard

- uso de cards
- informações resumidas
- indicadores principais
- layout organizado por grid

---

## 🔄 Estados de UI (IA deve completar)

A IA deve definir:

- hover
- focus
- active
- disabled
- error

Mantendo consistência com as cores e tokens definidos.

---

## 🤖 Diretrizes para IA

A IA deve:

- seguir este documento como base obrigatória
- respeitar os tokens definidos
- manter consistência entre telas
- criar componentes reutilizáveis
- aplicar padrão SaaS moderno
- evitar excesso visual

---

## 🧩 Componentes Base Esperados

- Button (variants)
- Input
- Select
- Table
- Card
- Modal
- Badge
- Sidebar
- Header
- Empty State
- Loading State

---

## 🎯 Liberdade Controlada para IA

A IA PODE definir:

- layouts detalhados
- dashboards
- organização visual
- microinterações

A IA NÃO DEVE:

- quebrar padrões definidos
- inventar cores fora do sistema
- usar valores arbitrários
- criar estilos inconsistentes

-
