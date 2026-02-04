import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProfileSetupDto {
  @IsInt()
  @Min(1)
  dailyMinutes!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredSlots?: string[];

  @IsInt()
  @Min(1)
  fatigueThreshold!: number;
}

export class ProfilePanicToggleDto {
  @IsBoolean()
  enabled!: boolean;
}
