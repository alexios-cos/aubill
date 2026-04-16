import { registerAs } from "@nestjs/config";

export interface SecurityConfig {
    jwtAccessSecret: string;
    jwtAccessTokenTTL: number;
    jwtRefreshSecret: string;
    jwtRefreshTokenTTL: number;
}

export const getConfig = (): SecurityConfig => {
    return {
        jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? '',
        jwtAccessTokenTTL: parseInt(process.env.JWT_ACCESS_TOKEN_TTL_MS ?? '600000'),
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
        jwtRefreshTokenTTL: parseInt(process.env.JWT_REFRESH_TOKEN_TTL_MS ?? '2592000000'),
    };
}

export default registerAs('security', (): SecurityConfig => <SecurityConfig>(getConfig()));