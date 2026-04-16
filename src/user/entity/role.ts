import { Column, Entity } from "typeorm";
import { CreatedAtAwareEntity } from "../../database/entity/common-entity.js";
import { RoleName } from "../config.js";

@Entity()
export class Role extends CreatedAtAwareEntity {

    @Column({
        type: 'varchar',
        length: 255,
    })
    name!: RoleName;

}