import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "../../user/config.js";
import { UserAwareRequest } from "../config.js";
import { UserRoleService } from "../../user/service/user-role.service.js";

@Injectable()
export class PermissionGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
        private readonly userRoleService: UserRoleService,
    ) {
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.get<Permission[]>('permissions', context.getHandler());

        if (!requiredPermissions) {
            return true;
        }

        const request: UserAwareRequest = context.switchToHttp().getRequest();
        const user = request.user;

        const permissionList = await this.userRoleService.getPermissionList(user);

        const hasPermissions = requiredPermissions.some(permission => permissionList.includes(permission));
        if (!hasPermissions) {
            throw new ForbiddenException('You have no permission to perform this action');
        }

        return true;
    }

}