import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";
import { TableColumnOptions } from "typeorm/schema-builder/options/TableColumnOptions.js";

export class Init1776092359690 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const idColumn: TableColumnOptions = {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
        };

        const createdAtColumn: TableColumnOptions = {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
        };

        const updatedAtColumn: TableColumnOptions = {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: true,
        };

        await queryRunner.createTable(
            new Table({
                name: 'role',
                columns: [
                    idColumn,
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        isUnique: true,
                    },
                    createdAtColumn,
                ],
            }),
            true,
        );

        await queryRunner.createTable(
            new Table({
                name: 'user',
                columns: [
                    idColumn,
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '511',
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: 'role_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'refresh_token',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    createdAtColumn,
                    updatedAtColumn,
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'user',
            new TableForeignKey({
                columnNames: ['role_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'role',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'role_permission',
                columns: [
                    idColumn,
                    {
                        name: 'role_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    createdAtColumn,
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'role_permission',
            new TableForeignKey({
                columnNames: ['role_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'role',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'account',
                columns: [
                    idColumn,
                    {
                        name: 'user_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'balance',
                        type: 'float',
                        isNullable: false,
                        default: 0,
                    },
                    {
                        name: 'active',
                        type: 'boolean',
                        isNullable: false,
                        default: true,
                    },
                    {
                        name: 'blocked',
                        type: 'boolean',
                        isNullable: false,
                        default: false,
                    },
                    {
                        name: 'webhook_endpoint',
                        type: 'varchar',
                        length: '511',
                        isNullable: true,
                    },
                    createdAtColumn,
                    updatedAtColumn,
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'account',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'user',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'transfer',
                columns: [
                    idColumn,
                    {
                        name: 'donor_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'recipient_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'amount',
                        type: 'float',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'smallint',
                        isNullable: false,
                    },
                    createdAtColumn,
                    updatedAtColumn,
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'transfer',
            new TableForeignKey({
                columnNames: ['donor_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'account',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'transfer',
            new TableForeignKey({
                columnNames: ['recipient_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'account',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: 'transaction',
                columns: [
                    idColumn,
                    {
                        name: 'account_id',
                        type: 'int',
                        isNullable: false,
                    },
                    {
                        name: 'transfer_id',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'amount',
                        type: 'float',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'smallint',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'smallint',
                        isNullable: false,
                    },
                    createdAtColumn,
                    updatedAtColumn,
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'transaction',
            new TableForeignKey({
                columnNames: ['account_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'account',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'transaction',
            new TableForeignKey({
                columnNames: ['transfer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'transfer',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tables = [
            'transaction',
            'transfer',
            'role_permission',
            'account',
            'user',
            'role',
        ];

        for (const table of tables) {
            await queryRunner.dropTable(table);
        }
    }

}
