import { IsEnum, IsInt, IsString, Max, Min, IsIn } from "class-validator";

export enum Shift {
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON",
  NIGHT = "NIGHT",
}

export class CreateClassDto {
  @IsInt({ message: "year_id deve ser um número inteiro." })
  year_id: number;

  @IsInt({ message: "series deve ser um número inteiro." })
  @Min(1, { message: "series deve ser 1, 2 ou 3." })
  @Max(3, { message: "series deve ser 1, 2 ou 3." })
  series: number;

  @IsString({ message: "letter deve ser uma string." })
  @IsIn(["A", "B", "C", "D", "E"], {
    message: "letter deve ser A, B, C, D ou E.",
  })
  letter: string;

  @IsEnum(Shift, {
    message: "shift deve ser MORNING, AFTERNOON ou NIGHT.",
  })
  shift: Shift;
}
