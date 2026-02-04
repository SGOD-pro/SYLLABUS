import { IsOptional, IsString } from "class-validator";

export class CreateUser {
    @IsString()
    email: string

    @IsString()
    name: string

    @IsString()
    clerkUserId: string

    @IsString()
    @IsOptional()
    university?: string;

    @IsString()
    @IsOptional()
    profilePic?: string;

    @IsString()
    @IsOptional()
    targetCompanies?: string[];

}