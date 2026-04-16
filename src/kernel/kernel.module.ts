import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import environmentConfig from "./config/environment.config.js";
import databaseConfig from "./config/database.config.js";
import { AuthModule } from "../auth/auth.module.js";
import securityConfig from "./config/security.config.js";
import { AccountModule } from "../account/account.module.js";
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [
                environmentConfig,
                databaseConfig,
                securityConfig,
            ]
        }),
        EventEmitterModule.forRoot(),
        AuthModule,
        AccountModule,
    ],
})
export class KernelModule {}