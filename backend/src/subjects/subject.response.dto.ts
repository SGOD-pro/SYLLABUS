import { IsBoolean, IsDateString, IsInt, IsString } from 'class-validator';

export class SubjectResponseDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsDateString()
  examDate!: string;

  @IsBoolean()
  isBacklog!: boolean;

  @IsInt()
  priorityWeight!: number;
}
