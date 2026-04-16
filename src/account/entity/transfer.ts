import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { TimestampAwareEntity } from "../../database/entity/common-entity.js";
import { TransferDirection, TransferStatus } from "../config.js";
import { Account } from "./account.js";

@Entity()
export class Transfer extends TimestampAwareEntity {

    @RelationId((transfer: Transfer) => transfer.donor)
    donorId!: number;

    @RelationId((transfer: Transfer) => transfer.recipient)
    recipientId!: number;

    @Column({
        type: 'float',
    })
    amount!: number;

    @Column({
        type: 'smallint',
    })
    status!: TransferStatus;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'donor_id' })
    donor?: Account;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'recipient_id' })
    recipient?: Account;

    direction?: TransferDirection;

}