import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { CreatedAtAwareEntity } from "../../database/entity/common-entity.js";
import { Role } from "./role.js";
import { Permission } from "../config.js";

@Entity()
export class RolePermission extends CreatedAtAwareEntity {

    @RelationId((permission: RolePermission) => permission.role)
    roleId!: number;

    @Column({
        type: 'varchar',
        length: 255,
    })
    name!: Permission;

    @ManyToOne(() => Role)
    @JoinColumn({ name: 'role_id' })
    role?: Role;

}