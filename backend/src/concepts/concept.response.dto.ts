import { IsArray, IsInt, IsString } from 'class-validator';

export class ConceptResponseDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsInt()
  difficulty: number;

  @IsInt()
  estimatedMinutes: number;

  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];
}
