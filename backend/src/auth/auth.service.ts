import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { JwtPayload } from './strategies/jwt.strategy'

export interface AuthTokenResponse {
  access_token: string
  token_type: 'Bearer'
  user: {
    id: string
    email: string
    role: string
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        is_active: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.')
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Usuário inativo. Contate o administrador.')
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password)

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas.')
    }

    const payload: JwtPayload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    }

    const access_token = await this.jwt.signAsync(payload)

    return {
      access_token,
      token_type: 'Bearer',
      user: {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
      },
    }
  }

  async validateToken(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
      },
    })

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Token inválido ou expirado.')
    }

    return {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    }
  }
}
