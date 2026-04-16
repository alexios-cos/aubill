import { ApiProperty } from "@nestjs/swagger";
import { User } from "../entity/user.js";
import { Expose, plainToInstance } from 'class-transformer';

export type UserSchemaShape = Pick<User, 'id' | 'email' | 'roleId' | 'name' | 'createdAt' | 'updatedAt'>

export class UserSchema implements UserSchemaShape {

    @Expose()
    @ApiProperty()
    public readonly id!: number;

    @Expose()
    @ApiProperty()
    public readonly email!: string;

    @Expose()
    @ApiProperty()
    public readonly roleId!: number;

    @Expose()
    @ApiProperty()
    public readonly name!: string;

    @Expose()
    @ApiProperty()
    public readonly createdAt!: Date;

    @Expose()
    @ApiProperty()
    public readonly updatedAt!: Date;

    static fromEntity(user: User): UserSchema {
        return plainToInstance(UserSchema, user, { excludeExtraneousValues: true });
    }

}