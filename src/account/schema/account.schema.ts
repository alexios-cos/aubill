import { Account } from "../entity/account.js";
import { Expose, plainToInstance } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export type AccountSchemaShape = Pick<Account, 'id' | 'userId' | 'name' | 'balance' | 'active' | 'blocked' | 'webhookEndpoint' | 'createdAt' | 'updatedAt'>;

export class AccountSchema implements AccountSchemaShape {

    @Expose()
    @ApiProperty()
    public readonly id!: number;

    @Expose()
    @ApiProperty()
    public readonly userId!: number;

    @Expose()
    @ApiProperty()
    public readonly name!: string;

    @Expose()
    @ApiProperty()
    public readonly balance!: number;

    @Expose()
    @ApiProperty()
    public readonly active!: boolean;

    @Expose()
    @ApiProperty()
    public readonly blocked!: boolean;

    @Expose()
    @ApiPropertyOptional()
    public readonly webhookEndpoint?: string;

    @Expose()
    @ApiProperty()
    public readonly createdAt!: Date;

    @Expose()
    @ApiProperty()
    public readonly updatedAt!: Date;

    static fromEntity(account: Account): AccountSchema {
        return plainToInstance(AccountSchema, account, { excludeExtraneousValues: true });
    }

}