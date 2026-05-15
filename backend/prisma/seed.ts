import 'dotenv/config'
import * as bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

type SeedUser = {
  email: string
  role: 'SECRETARIA' | 'PROFESSOR' | 'ALUNO'
}

const seedUsers: SeedUser[] = [
  { email: 'admin@classon.com', role: 'SECRETARIA' },
  { email: 'prof1@classon.com', role: 'PROFESSOR' },
  { email: '26101@aluno.classon.com', role: 'ALUNO' },
]

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const emails = seedUsers.map((user) => user.email)

  const existingUsers = await prisma.users.findMany({
    where: { email: { in: emails } },
    select: { email: true, id: true },
  })

  const maxIdRecord = await prisma.users.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })

  let nextId = maxIdRecord?.id ?? BigInt(0)
  const idByEmail = new Map<string, bigint>(
    existingUsers.map((user) => [user.email, user.id] as const),
  )

  for (const user of seedUsers) {
    if (!idByEmail.has(user.email)) {
      nextId += BigInt(1)
      idByEmail.set(user.email, nextId)
    }
  }

  const hashedPassword = await bcrypt.hash('123456', 10)

  for (const user of seedUsers) {
    await prisma.users.upsert({
      where: { email: user.email },
      update: {
        password: hashedPassword,
        role: user.role,
        is_active: true,
      },
      create: {
        id: idByEmail.get(user.email)!,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        is_active: true,
        created_at: new Date(),
      },
    })
  }

  console.log('Seed concluido com sucesso.')
}

main()
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
