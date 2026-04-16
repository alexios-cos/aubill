import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { TimestampAwareEntity } from "../../database/entity/common-entity.js";
import { TransactionStatus, TransactionType } from "../config.js";
import { Account } from "./account.js";
import { Transfer } from "./transfer.js";

@Entity()
export class Transaction extends TimestampAwareEntity {

    @RelationId((transaction: Transaction) => transaction.account)
    accountId!: number;

    @RelationId((transaction: Transaction) => transaction.transfer)
    transferId?: number|null;

    @Column({
        type: 'float',
    })
    amount!: number;

    @Column({
        type: 'smallint',
    })
    type!: TransactionType;

    @Column({
        type: 'smallint',
    })
    status!: TransactionStatus;

    @ManyToOne(() => Account)
    @JoinColumn({ name: 'account_id' })
    account?: Account;

    @ManyToOne(() => Transfer)
    @JoinColumn({ name: 'transfer_id' })
    transfer?: Transfer|null;

}