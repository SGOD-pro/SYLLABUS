import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsDateString()
  examDate: string;

  @IsBoolean()
  @IsOptional()
  isBacklog?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  priorityWeight?: number;
}
