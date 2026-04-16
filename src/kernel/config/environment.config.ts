import { registerAs } from "@nestjs/config";

export enum NodeEnv {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
}

export interface EnvironmentConfig {
    nodeEnv: NodeEnv
    webPort: number
}

export const getConfig = (): EnvironmentConfig => {
    return {
        nodeEnv: process.env.NODE_ENV as NodeEnv ?? NodeEnv.DEVELOPMENT,
        webPort: process.env.APP_WEB_PORT ? parseInt(process.env.APP_WEB_PORT) : 3000,
    }
}

export default registerAs('environment', (): EnvironmentConfig => <EnvironmentConfig>(getConfig()));