import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { UserService } from "./service/user.service.js";
import { ROLE_PERMISSION_REPOSITORY, ROLE_REPOSITORY, USER_REPOSITORY } from "./config.js";
import { DataSource } from "typeorm";
import { User } from "./entity/user.js";
import { DATA_SOURCE } from "../database/config.js";
import { UserController } from "./controller/user.controller.js";
import { Role } from "./entity/role.js";
import { RoleService } from "./service/role.service.js";
import { RolePermission } from "./entity/role-permission.js";
import { UserRoleService } from "./service/user-role.service.js";

@Module({
    imports: [
        DatabaseModule,
    ],
    providers: [
        {
            provide: USER_REPOSITORY,
            useFactory: async (dataSource: DataSource) => dataSource.getRepository(User),
            inject: [DATA_SOURCE],
        },
        {
            provide: ROLE_REPOSITORY,
            useFactory: async (dataSource: DataSource) => dataSource.getRepository(Role),
            inject: [DATA_SOURCE],
        },
        {
            provide: ROLE_PERMISSION_REPOSITORY,
            useFactory: async (dataSource: DataSource) => dataSource.getRepository(RolePermission),
            inject: [DATA_SOURCE],
        },
        UserService,
        RoleService,
        UserRoleService,
    ],
    exports: [
        USER_REPOSITORY,
        ROLE_REPOSITORY,
        ROLE_PERMISSION_REPOSITORY,
        UserService,
        RoleService,
        UserRoleService,
    ],
    controllers: [
        UserController,
    ],
})
export class UserModule {}