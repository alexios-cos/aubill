import { Transaction } from "../entity/transaction.js";
import {
    TransactionStatus, transactionStatusMap,
    TransactionStatusSchema,
    TransactionType,
    transactionTypeMap,
    TransactionTypeSchema
} from "../config.js";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";


export type TransactionSchemaShape = Pick<Transaction, 'id' | 'accountId' | 'transferId' | 'type' | 'status' | 'amount' | 'createdAt' | 'updatedAt'>;

export class TransactionSchema implements TransactionSchemaShape {

    @Expose()
    @ApiProperty()
    public readonly id!: number;

    @Expose()
    @ApiProperty()
    public readonly accountId!: number;

    @Expose()
    @ApiPropertyOptional()
    public readonly transferId?: number;

    @Expose()
    @Transform(({ value }) => transactionTypeMap[value as TransactionType])
    @ApiProperty({ enum: TransactionTypeSchema })
    public readonly type!: TransactionType;

    @Expose()
    @Transform(({ value }) => transactionStatusMap[value as TransactionStatus])
    @ApiProperty({ enum: TransactionStatusSchema })
    public readonly status!: TransactionStatus;

    @Expose()
    @ApiProperty()
    public readonly amount!: number;

    @Expose()
    @ApiProperty()
    public readonly createdAt!: Date;

    @Expose()
    @ApiProperty()
    public readonly updatedAt!: Date;

    static fromEntity(transaction: Transaction): TransactionSchema {
        return plainToInstance(TransactionSchema, transaction, { excludeExtraneousValues: true });
    }

}