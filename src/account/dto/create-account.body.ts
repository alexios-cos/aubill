import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";
import { CreateAccountDto } from "../config.js";

export class CreateAccountBody implements CreateAccountDto {

    @MaxLength(255)
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name!: string;

    @MaxLength(511)
    @IsUrl()
    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    webhookEndpoint?: string;

}