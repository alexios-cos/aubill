import { MakeAccountTransferDto } from "../config.js";
import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MakeAccountTransferBody implements MakeAccountTransferDto {

    @Min(0.01)
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    recipientAccountId: number;

}