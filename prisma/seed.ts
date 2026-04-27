import { PrismaClient } from '../generated/prisma'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  const adminEmail = 'admin@classon.com'
  const adminPassword = 'admin123'

  const existingAdmin = await prisma.users.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const maxId = await prisma.users.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  })

  const nextId = maxId ? BigInt(maxId.id) + BigInt(1) : BigInt(1)

  await prisma.users.create({
    data: {
      id: nextId,
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      is_active: true,
      created_at: new Date(),
    },
  })

  console.log('Admin user created successfully!')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
