import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from "@nestjs/common";
import { SignInBody } from "../dto/sign-in.body.js";
import { AuthenticationService, TokenPayload } from "../service/authentication.service.js";
import type { Response } from 'express';
import { ConfigService } from "@nestjs/config";
import { EnvironmentConfig, NodeEnv } from "../../kernel/config/environment.config.js";
import { ApiCookieAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserSchema } from "../../user/schema/user.schema.js";
import {
    UNAUTHORIZED_AUTHENTICATION_DESCRIPTION,
    UNAUTHORIZED_REFRESH_DESCRIPTION,
    type UserAwareRequest
} from "../config.js";
import { RefreshJwtGuard } from "../guard/refresh.jwt.guard.js";
import { AuthJwtGuard } from "../guard/auth.jwt.guard.js";
import { RequirePermissions } from "../decorators.js";
import { Permission } from "../../user/config.js";

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly configService: ConfigService,
    ) {}

    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: UserSchema })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    public async signIn(@Body() dto: SignInBody, @Res({ passthrough: true }) res: Response): Promise<UserSchema> {
        const { accessToken, refreshToken, user } = await this.authenticationService.signIn(dto);

        this.setAuthCookies(res, accessToken, refreshToken);

        return UserSchema.fromEntity(user);
    }

    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_REFRESH_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.OK, type: UserSchema })
    @ApiCookieAuth()
    @RequirePermissions(Permission.AUTH_REFRESH)
    @UseGuards(RefreshJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    public async refresh(
        @Req() req: UserAwareRequest,
        @Res({ passthrough: true }) res: Response
    ): Promise<UserSchema> {
        const { accessToken, refreshToken, user } = await this.authenticationService.reSignIn(req.user);

        this.setAuthCookies(res, accessToken, refreshToken);

        return UserSchema.fromEntity(user);
    }

    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully logout' })
    @ApiCookieAuth()
    @RequirePermissions(Permission.LOGOUT)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    public async logout(
        @Req() req: UserAwareRequest,
        @Res({ passthrough: true }) res: Response
    ): Promise<{ message: string }> {
        await this.authenticationService.signOut(req.user);

        res.clearCookie('Authentication');
        res.clearCookie('Refresh');

        return {
            message: 'Successfully logout'
        };
    }

    private setAuthCookies(
        res: Response,
        accessToken: TokenPayload,
        refreshToken: TokenPayload
    ): void {
        const envConfig = this.configService.get<EnvironmentConfig>('environment') as EnvironmentConfig;

        res.cookie(
            'Authentication',
            `Bearer ${accessToken.token}`,
            {
                httpOnly: true,
                secure: envConfig.nodeEnv === NodeEnv.PRODUCTION,
                expires: accessToken.expirationDate,
                sameSite: 'lax',
                path: '/',
            },
        );

        res.cookie(
            'Refresh',
            refreshToken.token,
            {
                httpOnly: true,
                secure: envConfig.nodeEnv === NodeEnv.PRODUCTION,
                expires: refreshToken.expirationDate,
                sameSite: 'lax',
                path: '/',
            },
        );
    }

}