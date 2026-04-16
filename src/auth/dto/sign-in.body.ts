import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SignInBody {

    @MaxLength(511)
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    public readonly email: string;

    @MaxLength(255)
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    public readonly password: string;

}