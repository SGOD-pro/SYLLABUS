import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class ProfileResponseDto {
  @IsString()
  id: string;

  @IsInt()
  dailyMinutes: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredSlots?: string[];

  @IsInt()
  fatigueThreshold: number;

  @IsBoolean()
  panicMode: boolean;
}
