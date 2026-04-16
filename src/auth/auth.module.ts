import { Module } from "@nestjs/common";
import { AuthenticationService } from "./service/authentication.service.js";
import { AuthenticationController } from "./controller/authentication.controller.js";
import { UserModule } from "../user/user.module.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule,
        UserModule,
        JwtModule.register({ global: true })
    ],
    providers: [
        AuthenticationService,
    ],
    exports: [
        AuthenticationService,
    ],
    controllers: [
        AuthenticationController,
    ],
})
export class AuthModule {}