import { registerAs } from "@nestjs/config";

export interface DatabaseConfig {
    dbUrl: string;
}

export const getConfig = (): DatabaseConfig => {
    return {
        dbUrl: process.env.DATABASE_URL ?? '',
    };
}

export default registerAs('database', (): DatabaseConfig => <DatabaseConfig>(getConfig()));