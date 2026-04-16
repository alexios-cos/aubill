import { DepositAccountDto } from "../config.js";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, Min } from "class-validator";

export class DepositAccountBody implements DepositAccountDto {

    @Min(0.01)
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    amount: number;

}