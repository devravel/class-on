import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface TeacherProfile {
  id: bigint;
  user_id: bigint;
  full_name: string;
  registration_code: string;
}

export interface StudentClassInfo {
  series: number;
  letter: string;
  education_level: string;
}

export interface StudentProfile {
  id: bigint;
  user_id: bigint;
  rm: string;
  full_name: string;
  status: string;
  current_class?: StudentClassInfo;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  teacher?: TeacherProfile;
  student?: StudentProfile;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.users.findUnique({
      where: { id: BigInt(payload.sub) },
      select: {
        id: true,
        email: true,
        role: true,
        is_active: true,
        teachers: {
          select: {
            id: true,
            user_id: true,
            full_name: true,
            registration_code: true,
          },
        },
        students: {
          select: {
            id: true,
            user_id: true,
            rm: true,
            full_name: true,
            status: true,
            enrollments: {
              include: {
                classes: {
                  include: {
                    academic_years: {
                      select: { status: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException("Sessão inválida ou usuário inativo.");
    }

    const authenticated: AuthenticatedUser = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    if (user.role === "PROFESSOR") {
      if (!user.teachers) {
        throw new UnauthorizedException("Perfil de professor não encontrado.");
      }
      authenticated.teacher = user.teachers;
    }

    if (user.role === "ALUNO") {
      if (!user.students) {
        throw new UnauthorizedException("Perfil de aluno não encontrado.");
      }

      const { enrollments, ...studentBase } = user.students;
      const activeEnrollment =
        enrollments.find(
          (enrollment) =>
            enrollment.classes.academic_years.status === "ACTIVE",
        ) ?? enrollments[0];

      authenticated.student = {
        ...studentBase,
        ...(activeEnrollment && {
          current_class: {
            series: activeEnrollment.classes.series,
            letter: activeEnrollment.classes.letter,
            education_level: activeEnrollment.classes.education_level,
          },
        }),
      };
    }

    return authenticated;
  }
}
