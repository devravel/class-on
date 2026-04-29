# 🎨 DESIGN SYSTEM — ClassOn

---

## 🎯 Filosofia do Design

O ClassOn segue um padrão de interface:

- **Limpa e moderna:** Redução de elementos visuais desnecessários.
- **Foco em produtividade:** Facilidade de acesso às ações principais.
- **Baixo ruído visual:** Uso estratégico de espaços em branco (negative space).
- **Alto contraste e legibilidade:** Tipografia clara e cores acessíveis.
- **Padrão SaaS administrativo:** Interface robusta para gestão de dados.

A interface deve priorizar:

- Clareza de informação.
- Rapidez de uso.
- Consistência visual.
- Hierarquia bem definida.

---

## 🎨 Colors

### Brand (Definições Base)

- **primary:** `#4299E1` (Blue 500)
- **primary-light:** `#BEE3F8` (Blue 200)
- **primary-dark:** `#2B6CB0` (Blue 700)

### Neutrals

- **gray-100:** `#F7FAFC`
- **gray-200:** `#EDF2F7`
- **gray-300:** `#E2E8F0`
- **gray-400:** `#CBD5E0`
- **gray-500:** `#A0AEC0`
- **gray-600:** `#718096`
- **gray-700:** `#4A5568`
- **gray-800:** `#2D3748`
- **gray-900:** `#1A202C`

### Feedback / States

- **success:** `#48BB78`
- **warning:** `#ED8936`
- **error:** `#F56565`
- **info:** `#4299E1`

---

## 🔄 Estados de UI

_A IA deve aplicar estes tokens em todos os componentes interativos:_

- **hover:** Redução de 10% na luminosidade (ex: `hover:bg-primary-dark/90`).
- **focus:** Ring de 2px com cor `primary` e offset de 2px.
- **active:** Leve escala para baixo (98%) ou profundidade negativa.
- **disabled:** Opacidade de 50% e cursor `not-allowed`.
- **error:** Bordas e textos em cor `error`, acompanhados de ícone de alerta.

---

## 🔤 Typography

**Font principal:** Inter

### Escala tipográfica

- **xs:** 12px
- **sm:** 14px
- **md:** 16px
- **lg:** 18px
- **xl:** 20px
- **2xl:** 24px
- **3xl:** 32px

### Pesos

- **regular:** 400
- **medium:** 500
- **semibold:** 600
- **bold:** 700

---

## 📏 Spacing System

### Micro spacing

- **4px**
- **8px**
- **12px**

### Default spacing

- **16px**
- **24px**

### Macro spacing

- **32px**
- **40px**
- **48px**
- **64px**

---

## 🧱 Grid & Layout

### Desktop

- **12 colunas**
- **max-width:** 1280px
- **gutter:** 24px

### Mobile / Tablet

- **4 colunas**
- **margin:** 16px

---

## 🔲 Border Radius

- **8px:** inputs, badges, botões.
- **12px:** cards de conteúdo.
- **16px:** modais e diálogos.

---

## 🌫️ Shadows

- **leve:** `0 1px 3px 0 rgb(0 0 0 / 0.1)` (cards informativos).
- **média:** `0 4px 6px -1px rgb(0 0 0 / 0.1)` (modais e dropdowns).
- **none:** estados flat ou bordas simples em `gray-300`.

---

## 🧩 Iconografia

- **biblioteca:** Lucide React
- **estilo:** outline (espessura 2px)
- **tamanhos:**
  - **16px:** tabelas e inline text
  - **20px:** botões e inputs
  - **24px:** navegação e títulos

---

## 🖼️ Logo

- **Formato:** SVG (principal) / PNG (fallback)
- **Local:** `/public/assets/logo/`
- **Variações:** padrão, branco (dark mode/contrast), ícone (compacto).

---

## ⚙️ Stack de UI (OBRIGATÓRIO)

- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

---

## 🎨 Regras de Estilização

- Usar apenas Tailwind (evitar `style={{}}`).
- Proibido CSS puro ou Styled Components.
- Não usar valores hardcoded (ex: use `bg-primary` em vez de `bg-[#4299E1]`).
- Sempre utilizar tokens definidos neste sistema.

---

## 🧱 Layout Base

- **Sidebar fixa:** Navegação à esquerda com fundo `gray-900` ou `white`.
- **Header superior:** Breadcrumbs, busca e perfil do usuário.
- **Área central:** Fundo `gray-100` com conteúdo em Cards brancos.

---

## 📋 Padrão de Tabelas

- Campo de busca e filtros no topo.
- Ações por linha (ícones ou menu dropdown).
- Paginação clara no rodapé.
- **Empty State:** Ilustração leve + mensagem de "Nenhum dado encontrado".
- **Loading:** Uso de Skeleton screens do shadcn/ui.

---

## 📝 Padrão de Formulários

- Labels sempre acima dos campos.
- Validação em tempo real com Zod.
- Mensagens de erro visíveis em `error` color.
- Agrupamento de campos relacionados por seções.

---

## 📊 Dashboard

- Cards de KPI no topo com indicadores principais.
- Gráficos minimalistas.
- Layout organizado por prioridade de informação.

---

## 🤖 Diretrizes para IA

- Seguir este documento como base obrigatória.
- Manter consistência entre telas.
- Criar componentes reutilizáveis na pasta `@/components`.
- Aplicar padrão SaaS moderno.

---

## 🧩 Componentes Base Esperados

- **Button:** variantes primary, secondary, outline, ghost.
- **Input/Select/Checkbox:** estilos shadcn customizados.
- **Table/Card/Modal/Badge:** componentes estruturais.
- **Empty/Loading States:** para consistência de UX.

---

## 🎯 Liberdade Controlada para IA

- **PODE:** Definir layouts detalhados, dashboards, organização visual e microinterações.
- **NÃO DEVE:** Quebrar padrões, inventar cores arbitrárias ou usar estilos inconsistentes com o sistema ClassOn.

## Tela de Login esperada:

docs/PROFESSOR.png
docs/SECRETARIA.png
docs/ALUNO.png
