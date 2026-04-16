import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthenticationService, JwtPayload } from "../service/authentication.service.js";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../../user/service/user.service.js";
import { UserAwareRequest } from "../config.js";
import { ConfigService } from "@nestjs/config";
import { SecurityConfig } from "../../kernel/config/security.config.js";

@Injectable()
export class RefreshJwtGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly authenticationService: AuthenticationService,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: UserAwareRequest = context.switchToHttp().getRequest();
        const refreshToken = request.cookies?.Refresh;

        if (!refreshToken) {
            throw new UnauthorizedException();
        }

        const securityConfig = this.configService.get<SecurityConfig>('security') as SecurityConfig;

        try {
            const payload: JwtPayload = await this.jwtService.verifyAsync(
                refreshToken,
                {
                    secret: securityConfig.jwtRefreshSecret,
                }
            );

            const user = await this.userService.get(payload.sub);

            if (!user) {
                throw new Error();
            }

            await this.authenticationService.verifyRefreshToken(refreshToken, user);

            request.user = user;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }

}