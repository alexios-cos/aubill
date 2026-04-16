import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { TimestampAwareEntity } from "../../database/entity/common-entity.js";
import { Role } from "./role.js";

@Entity()
export class User extends TimestampAwareEntity {

    @Column({
        type: 'varchar',
        length: 511
    })
    email!: string;

    @RelationId((user: User) => user.role)
    roleId!: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    password!: string;

    @Column({
        name: 'refresh_token',
        type: 'varchar',
        length: 255,
    })
    refreshToken?: string|null;

    @Column({
        type: 'varchar',
        length: 255
    })
    name!: string;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id' })
    role?: Role

}