import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { UpdateAccountDto } from "../config.js";

export class UpdateAccountBody implements UpdateAccountDto {

    @MaxLength(255)
    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    name?: string;

    @MaxLength(511)
    @IsUrl()
    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    webhookEndpoint?: string;

}