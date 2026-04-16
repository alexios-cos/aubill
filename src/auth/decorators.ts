import { Permission } from "../user/config.js";
import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { PermissionGuard } from "./guard/permission.guard.js";

export function RequirePermissions(...permissions: Permission[]) {
    return applyDecorators(
        SetMetadata('permissions', permissions),
        UseGuards(PermissionGuard),
    )
}