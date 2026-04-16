import { Transfer } from "../entity/transfer.js";
import {
    TransferDirection,
    TransferStatus,
    transferStatusMap,
    TransferStatusSchema
} from "../config.js";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";

export type TransferSchemaShape = Pick<Transfer, 'id' | 'donorId' | 'recipientId' | 'status' | 'direction' | 'amount' | 'createdAt' | 'updatedAt'>;

export class TransferSchema implements TransferSchemaShape {

    @Expose()
    @ApiProperty()
    public readonly id!: number;

    @Expose()
    @ApiProperty()
    public readonly donorId!: number;

    @Expose()
    @ApiProperty()
    public readonly recipientId!: number;

    @Expose()
    @Transform(({ value }) => transferStatusMap[value as TransferStatus])
    @ApiProperty({ enum: TransferStatusSchema })
    public readonly status!: TransferStatus;

    @Expose()
    @ApiPropertyOptional()
    public readonly direction?: TransferDirection;

    @Expose()
    @ApiProperty()
    public readonly amount!: number;

    @Expose()
    @ApiProperty()
    public readonly createdAt!: Date;

    @Expose()
    @ApiProperty()
    public readonly updatedAt!: Date;

    static fromEntity(transfer: Transfer): TransferSchema {
        return plainToInstance(TransferSchema, transfer, { excludeExtraneousValues: true });
    }

}