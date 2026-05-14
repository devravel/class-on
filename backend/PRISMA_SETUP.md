# Infraestrutura Prisma - Backend ClassOn

## ✅ Arquitetura Final

```
backend/
├── prisma/
│   ├── schema.prisma         # Schema oficial único
│   ├── migrations/           # Migrations existentes
│   └── seed.ts              # Seed oficial
├── generated/
│   └── prisma/              # Prisma Client gerado (não commitar)
├── src/
│   └── prisma/
│       └── prisma.service.ts # PrismaService configurado
├── .env                     # Variáveis de ambiente
├── prisma.config.ts         # Configuração Prisma 7
├── tsconfig.json            # TypeScript config
├── tsconfig.seed.json       # TypeScript config para seed
└── package.json             # Dependências e scripts
```

## 🔧 Configuração Prisma 7

### prisma.config.ts
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "ts-node ./prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### schema.prisma
- **IMPORTANTE**: No Prisma 7, o datasource NÃO deve ter `url`
- A URL é configurada via `prisma.config.ts` e passada no constructor do PrismaClient

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  // NÃO usar url aqui no Prisma 7
}
```

### PrismaService (src/prisma/prisma.service.ts)
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

### Seed (prisma/seed.ts)
```typescript
import 'dotenv/config'
import * as bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
```

### package.json
```json
{
  "prisma": {
    "seed": "ts-node --project tsconfig.seed.json prisma/seed.ts"
  }
}
```

## 📋 Comandos Oficiais

### Dentro do diretório `backend/`:

```bash
# 1. Gerar Prisma Client
npx prisma generate

# 2. Aplicar migrations (requer DB rodando)
npx prisma migrate dev

# 3. Criar nova migration
npx prisma migrate dev --name nome_da_migration

# 4. Executar seed (requer DB rodando)
npx prisma db seed

# 5. Abrir Prisma Studio (requer DB rodando)
npx prisma studio

# 6. Build do backend
npm run build

# 7. Iniciar backend em dev
npm run start:dev

# 8. Iniciar backend em produção
npm run start:prod
```

### Iniciar banco de dados (na raiz do projeto):

```bash
# Iniciar Docker Desktop primeiro, depois:
docker-compose up -d

# Verificar status:
docker ps

# Ver logs:
docker-compose logs -f

# Parar:
docker-compose down
```

## 🎯 Imports Padronizados

Todos os arquivos que usam Prisma devem importar de:

```typescript
// Backend services (src/*)
import { PrismaClient } from '../../generated/prisma'

// Seed (prisma/seed.ts)
import { PrismaClient } from '../generated/prisma'
```

## ⚠️ Importante

1. **Nunca commitar** a pasta `generated/` (já está no .gitignore)
2. **Sempre executar** `npx prisma generate` após:
   - Clonar o repositório
   - Modificar `schema.prisma`
   - Trocar de branch que alterou o schema
3. **Docker Desktop** precisa estar rodando para comandos de migrate/seed/studio
4. **Prisma 7** usa arquitetura diferente - não adicionar `url` no datasource do schema

## 🔄 Alterações Realizadas

### Removidos:
- ❌ `prisma.config.ts` da raiz (movido para backend/)
- ❌ `tsconfig.seed.json` da raiz (movido para backend/)
- ❌ `.env` da raiz (recriado para docker-compose)
- ❌ `generated/` da raiz
- ❌ Imports complexos com `createRequire`
- ❌ Path alias `@prisma-client` no tsconfig

### Adicionados:
- ✅ `prisma.config.ts` em backend/
- ✅ `tsconfig.seed.json` em backend/
- ✅ Seção `"prisma"` no package.json
- ✅ Imports diretos e simples
- ✅ URL removida do datasource (Prisma 7)

### Corrigidos:
- ✅ Estrutura de pastas organizada
- ✅ Todos os paths relativos
- ✅ Configuração Prisma 7 adequada
- ✅ Build funcionando
- ✅ Prisma Client sendo gerado corretamente

## 🏥 Status da Infraestrutura

- ✅ **Prisma Client**: Gerado e funcionando
- ✅ **Backend Build**: Compilando sem erros
- ✅ **Imports**: Padronizados e funcionais
- ✅ **Configuração**: Limpa e profissional
- ⏳ **Migrations**: Prontas (aguardando DB iniciar)
- ⏳ **Seed**: Pronto (aguardando DB iniciar)

## 🚀 Próximos Passos

1. Iniciar Docker Desktop
2. Executar `docker-compose up -d` na raiz
3. Executar `npx prisma migrate dev` em backend/
4. Executar `npx prisma db seed` em backend/
5. Iniciar desenvolvimento: `npm run start:dev` em backend/
