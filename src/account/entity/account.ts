import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { TimestampAwareEntity } from "../../database/entity/common-entity.js";
import { User } from "../../user/entity/user.js";

@Entity()
export class Account extends TimestampAwareEntity {

    @RelationId((account: Account) => account.user)
    userId!: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    name!: string;

    @Column({
        type: 'float',
    })
    balance!: number;

    @Column({
        type: 'boolean',
    })
    active!: boolean;

    @Column({
        type: 'boolean',
    })
    blocked!: boolean;

    @Column({
        name: 'webhook_endpoint',
        type: 'varchar',
        length: 511,
        nullable: true,
    })
    webhookEndpoint?: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user?: User;

}