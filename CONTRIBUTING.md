# 🤝 Guia de Contribuição - ClassOn

Seja bem-vindo ao time de desenvolvimento! Para mantermos a organização enquanto escalamos para o Centro Paula Souza, seguimos estas regras:

## 1. Antes de começar

- Certifique-se de que você aceitou o convite para ser colaborador do repositório.
- Tenha o **Docker Desktop** instalado e o **WSL2** ativo.
- Configure seu arquivo `.env` local (copie do `.env.example`).

## 2. Fluxo de Trabalho

1. **Escolha uma Tarefa:** Vá na aba **Issues** e veja o que está disponível. Comente na Issue: "Vou fazer esta".
2. **Sincronize seu PC:** Antes de começar, sempre dê um `git pull origin main` para pegar as atualizações dos outros.
3. **Trabalhe:** Faça suas alterações nos arquivos.
4. **Envie:**
   ```bash
   git add .
   git commit -m "tipo: descrição curta do que foi feito"
   git push origin main
   ```

## 3. Padrão de Commits (Mensagens)

Para manter o histórico do projeto organizado e fácil de consultar, utilize a tabela de prefixos abaixo:

| Prefixo         | Quando usar?                                       | Exemplo de Mensagem                                   |
| :-------------- | :------------------------------------------------- | :---------------------------------------------------- |
| **`feat:`**     | Nova funcionalidade (Feature)                      | `feat: implementa login do professor`                 |
| **`fix:`**      | Correção de algum bug ou erro                      | `fix: corrige erro no calculo da media`               |
| **`db:`**       | Alterações no Banco de Dados (Prisma/Migrations)   | `db: cria tabela de alunos e turmas`                  |
| **`infra:`**    | Mudanças no Docker, .env ou scripts de deploy      | `infra: adiciona servico do redis no docker-compose`  |
| **`refactor:`** | Melhorar o código sem alterar sua funcionalidade   | `refactor: organiza validacoes do formulario`         |
| **`style:`**    | Mudanças apenas visuais (CSS/Tailwind) no Frontend | `style: ajusta responsividade do header`              |
| **`test:`**     | Adição ou modificação de testes                    | `test: adiciona teste unitario para criacao de aluno` |
| **`docs:`**     | Mudanças apenas em documentação                    | `docs: detalha entidades de alunos no mapeamento`     |

---

## 4. Regras de Ouro

- **⚠️ NUNCA suba o arquivo `.env` para o GitHub:** O arquivo `.gitignore` já está configurado para barrar esse envio, mas sempre confira antes de realizar o push.
- **🚫 NÃO altere arquivos de outros colegas:** Evite modificar arquivos em que seus parceiros estão trabalhando sem avisar previamente no grupo de comunicação do time.
- **❓ Na dúvida, pergunte:** Se não tiver certeza sobre um comando de Git ou uma alteração no código, consulte o líder de infraestrutura antes de prosseguir.
