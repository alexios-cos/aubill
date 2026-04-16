import { MigrationInterface, QueryRunner } from "typeorm";
import { Permission, RoleName } from "../../user/config.js";

export class CreateRoles1776178973301 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const roleNames = [
            RoleName.ADMIN,
            RoleName.CLIENT,
        ];

        const now = new Date();
        const roleRows: { name: RoleName; created_at: Date }[] = [];

        for (const roleName of roleNames) {
            roleRows.push({
                name: roleName,
                created_at: now,
            });
        }

        const roleValues: any[] = [];
        const rolePlaceholders: string[] = [];

        for (let i = 0; i < roleRows.length; i++) {
            const role = roleRows[i];
            const base = i * 2;
            rolePlaceholders.push(`($${base + 1}, $${base + 2})`);
            roleValues.push(role.name, role.created_at);
        }

        await queryRunner.query(
            `INSERT INTO "role" ("name", "created_at") VALUES ${rolePlaceholders.join(", ")}`,
            roleValues,
        );

        const clientRows = await queryRunner.query(
            `SELECT "id" FROM "role" WHERE "name" = $1 LIMIT 1`,
            [RoleName.CLIENT],
        );
        const adminRows = await queryRunner.query(
            `SELECT "id" FROM "role" WHERE "name" = $1 LIMIT 1`,
            [RoleName.ADMIN],
        );

        const clientRoleId = clientRows[0] && clientRows[0].id;
        const adminRoleId = adminRows[0] && adminRows[0].id;

        if (!clientRoleId || !adminRoleId) {
            throw new Error("Failed to create roles");
        }

        const roleIdMap: Partial<Record<RoleName, number>> = {
            [RoleName.CLIENT]: clientRoleId as number,
            [RoleName.ADMIN]: adminRoleId as number,
        };

        const clientPermissions = [
            Permission.AUTH_REFRESH,
            Permission.LOGOUT,
            Permission.WHO_AM_I,
            Permission.ACCOUNT_GET,
            Permission.ACCOUNT_LIST,
            Permission.ACCOUNT_CREATE,
            Permission.ACCOUNT_UPDATE,
            Permission.ACCOUNT_DEACTIVATE,
            Permission.ACCOUNT_ACTIVATE,
            Permission.ACCOUNT_DEPOSIT_GET,
            Permission.ACCOUNT_DEPOSIT_LIST,
            Permission.ACCOUNT_DEPOSIT_CREATE,
            Permission.ACCOUNT_TRANSFER_GET,
            Permission.ACCOUNT_TRANSFER_LIST,
            Permission.ACCOUNT_TRANSFER_CREATE,
            Permission.ACCOUNT_TRANSFER_CANCEL,
        ];

        const adminPermissions = [
            ...clientPermissions,
            Permission.USER_GET,
            Permission.USER_LIST,
            Permission.ACCOUNT_BLOCK,
            Permission.ACCOUNT_UNBLOCK,
            Permission.DEPOSIT_GET,
            Permission.DEPOSIT_LIST,
            Permission.DEPOSIT_CANCEL,
            Permission.TRANSFER_GET,
            Permission.TRANSFER_LIST,
            Permission.TRANSFER_CANCEL,
        ];

        const permissionsListMap: Partial<Record<RoleName, string[]>> = {
            [RoleName.CLIENT]: clientPermissions,
            [RoleName.ADMIN]: adminPermissions,
        };

        const permissionRows: { role_id: number; name: Permission; created_at: Date }[] = [];
        for (const roleName of roleNames) {
            for (const permission of (permissionsListMap[roleName] ?? [])) {
                permissionRows.push({
                    role_id: roleIdMap[roleName] as number,
                    name: Permission[permission],
                    created_at: now,
                });
            }
        }

        if (permissionRows.length > 0) {
            const values: any[] = [];
            const placeholders: string[] = [];

            for (let i = 0; i < permissionRows.length; i++) {
                const row = permissionRows[i];
                const base = i * 3;
                placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
                values.push(row.role_id, row.name, row.created_at);
            }

            await queryRunner.query(
                `INSERT INTO "role_permission" ("role_id", "name", "created_at") VALUES ${placeholders.join(", ")}`,
                values,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "role_permission"`);
        await queryRunner.query(`DELETE FROM "role"`);
    }

}
