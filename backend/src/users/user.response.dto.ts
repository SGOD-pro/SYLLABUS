import { IsInt, IsOptional, IsString } from 'class-validator';

export class UserResponseDto {
  @IsString()
  id: string;

  @IsString()
  clerkId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  degree?: string;

  @IsInt()
  @IsOptional()
  semester?: number;
}
