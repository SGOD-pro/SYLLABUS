import { IsArray, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateConceptDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  difficulty!: number;

  @IsInt()
  @Min(1)
  estimatedMinutes!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisites?: string[];
}
