import { SignInBody } from "../dto/sign-in.body.js";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../../user/service/user.service.js";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcrypt";
import { User } from "../../user/entity/user.js";
import { ConfigService } from "@nestjs/config";
import { SecurityConfig } from "../../kernel/config/security.config.js";
import { StringValue } from "ms";

export interface JwtPayload {
    sub: number;
}

export interface TokenPayload {
    token: string;
    expirationDate: Date;
}

export interface RefreshResult {
    user: User;
    accessToken: TokenPayload;
    refreshToken: TokenPayload;
}

export interface SignInResult extends RefreshResult {}

@Injectable()
export class AuthenticationService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    public async signIn(dto: SignInBody): Promise<SignInResult> {
        let user = await this.userService.getByEmail(dto.email);
        let signUp = false;

        if (!user) {
            user = await this.userService.createByDto(dto.email, await this.hash(dto.password));
            signUp = true;
        }

        const passwordMatch = await compare(dto.password, user.password);
        if (!signUp && !passwordMatch) {
            throw new UnauthorizedException();
        }

        return this.refresh(user);
    }

    public async reSignIn(user: User): Promise<SignInResult> {
        return this.refresh(user);
    }

    public async signOut(user: User): Promise<void> {
        await this.userService.deactivateAPI(user);
    }

    public async verifyRefreshToken(refreshToken: string, user: User): Promise<void> {
        if (!user.refreshToken) {
            throw new UnauthorizedException();
        }

        const refreshTokenMatch = await compare(refreshToken, user.refreshToken);

        if (!refreshTokenMatch) {
            throw new UnauthorizedException();
        }
    }

    private async refresh(user: User): Promise<RefreshResult> {
        const payload: JwtPayload = { sub: user.id };

        const securityConfig = this.configService.get<SecurityConfig>('security') as SecurityConfig;

        const accessTTL = securityConfig.jwtAccessTokenTTL;
        const refreshTTL = securityConfig.jwtRefreshTokenTTL;

        const accessToken = this.jwtService.sign<JwtPayload>(
            payload,
            {
                secret: securityConfig.jwtAccessSecret,
                expiresIn: `${accessTTL}Ms` as StringValue,
            }
        );

        const refreshToken = this.jwtService.sign<JwtPayload>(
            payload,
            {
                secret: securityConfig.jwtRefreshSecret,
                expiresIn: `${refreshTTL}Ms` as StringValue,
            }
        );

        user = await this.userService.activateAPI(user, { refreshToken: await this.hash(refreshToken) });

        return {
            user,
            accessToken: {
                token: accessToken,
                expirationDate: new Date(Date.now() + accessTTL),
            },
            refreshToken: {
                token: refreshToken,
                expirationDate: new Date(Date.now() + refreshTTL),
            }
        };
    }

    private async hash(password: string): Promise<string> {
        return hash(password, 10);
    }

}