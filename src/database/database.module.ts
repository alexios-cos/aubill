import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DATA_SOURCE } from "./config.js";
import { DataSource } from "typeorm";
import { dirname } from "path";

@Module({
    imports: [
        ConfigModule,
    ],
    providers: [
        {
            provide: DATA_SOURCE,
            useFactory: async (configService: ConfigService) => {
                const __filename = new URL(import.meta.url);
                const __dirname = dirname(__filename.pathname);

                const dataSource = new DataSource({
                    type: 'postgres',
                    url: configService.get<string>('database.dbUrl'),
                    entities: [
                        __dirname + '/../**/entity/*{.ts,.js}',
                    ],
                    migrations: [
                        __dirname + '/migration/**/*{.ts,.js}',
                    ],
                    synchronize: false,
                });

                return dataSource.initialize();
            },
            inject: [ConfigService],
        }
    ],
    exports: [
        DATA_SOURCE,
    ],
})
export class DatabaseModule {}