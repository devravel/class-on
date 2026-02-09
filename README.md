# 🚀 ClassOn - Sistema de Gestão Escolar

O **ClassOn** é uma plataforma moderna de gestão educacional desenvolvida para transformar a rotina de ETECs. Focado em UX intuitiva e performance, o sistema conecta secretaria, professores e alunos em um ambiente digital fluido e "sempre ligado".

## 📍 Fase Atual: [Planejamento & Setup]

Estamos no estágio de **Discovery**, mapeando as funcionalidades do sistema atual (NSA) e desenhando os fluxos de experiência no Figma.

## 🛠️ Stack Tecnológica (MVP)

- **Front-end:** Next.js + TypeScript + Tailwind CSS [cite: 61, 62, 65]
- **Back-end:** NestJS + TypeScript [cite: 73, 74]
- **Banco de Dados:** PostgreSQL (via Docker) [cite: 407, 408]
- **Design:** Figma [cite: 68]

## 🐳 Como rodar o ambiente de desenvolvimento

Para garantir que todos usem o mesmo banco de dados sem configurações manuais:

1. Instale o **Docker Desktop** e certifique-se de que o **WSL2** está ativo.
2. Na raiz do projeto, crie um arquivo `.env` copiando o conteúdo do `.env.example`.
3. No terminal, execute:
   ```bash
   docker compose up -d
   ```
4. O banco de dados PostgreSQL estará disponível na porta 5432.

## 📂 Organização do Repositório

```bash
/docs: Mapeamento de requisitos, dores do usuário e regras de negócio.

/backend: API e lógica do sistema (NestJS).

/frontend: Interface Web e Mobile PWA (Next.js).
```

## 📚 Documentação Detalhada

Para entender mais sobre o projeto, acesse nossos documentos:

- [Mapeamento de Requisitos (NSA)](./docs/mapeamento-requisitos.md)
- [Identidade Visual](./docs/identidade-visual.md)

## 🤝 Time & Contribuição

- **[Seu Nome]** - Líder de Infraestrutura & Backend
- **[Nome do Amigo 1]** - Desenvolvedor / Pesquisa
- **[Nome do Amigo 2]** - Desenvolvedor / Designer

Antes de realizar qualquer alteração, leia nosso [Guia de Contribuição](./CONTRIBUTING.md).

## ⌨️ Comandos Úteis

| Ação               | Comando                  |
| :----------------- | :----------------------- |
| **Sincronizar PC** | `git pull origin main`   |
| **Subir Banco**    | `docker compose up -d`   |
| **Verificar Logs** | `docker compose logs -f` |
| **Parar Banco**    | `docker compose down`    |
