import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../user/service/user.service.js";
import { JwtPayload } from "../service/authentication.service.js";
import type { Request } from 'express';
import { UserAwareRequest } from "../config.js";
import { ConfigService } from "@nestjs/config";
import { SecurityConfig } from "../../kernel/config/security.config.js";

@Injectable()
export class AuthJwtGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: UserAwareRequest = context.switchToHttp().getRequest();
        const token = this.extractTokenFromCookies(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        const securityConfig = this.configService.get<SecurityConfig>('security') as SecurityConfig;

        try {
            const payload: JwtPayload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: securityConfig.jwtAccessSecret,
                }
            );

            const user = await this.userService.get(payload.sub);

            if (!user) {
                throw new Error();
            }

            request.user = user;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractTokenFromCookies(request: Request): string|null {
        const [type, token] = request.cookies?.Authentication?.split(' ') ?? [];

        return type === 'Bearer' ? token : null;
    }

}