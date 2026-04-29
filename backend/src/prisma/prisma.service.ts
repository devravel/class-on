import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const requireFromBackend = createRequire(join(process.cwd(), 'package.json'))
const { PrismaClient } = requireFromBackend('../generated/prisma') as typeof import('../../../generated/prisma')

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
