import { Inject, Injectable } from "@nestjs/common";
import { User } from "../entity/user.js";
import { Permission, ROLE_PERMISSION_REPOSITORY } from "../config.js";
import { Repository } from "typeorm";
import { RolePermission } from "../entity/role-permission.js";

@Injectable()
export class UserRoleService {

    constructor(
        @Inject(ROLE_PERMISSION_REPOSITORY) private readonly rolePermissionRepository: Repository<RolePermission>,
    ) {}

    public async getPermissionList(user: User): Promise<Permission[]> {
        const permissions = await this.rolePermissionRepository.find({
            where: {
                role: {
                    id: user.roleId,
                }
            }
        });

        return permissions.map(p => p.name);
    }

}