import { registerAs } from "@nestjs/config";

export interface DatabaseConfig {
    dbUrl: string;
    dbUsername: string;
    dbPassword: string;
    dbName: string;
}

export const getConfig = (): DatabaseConfig => {
    return {
        dbUrl: process.env.DATABASE_URL ?? '',
        dbUsername: process.env.POSTGRES_USER ?? '',
        dbPassword: process.env.POSTGRES_PASSWORD ?? '',
        dbName: process.env.POSTGRES_DB ?? '',
    };
}

export default registerAs('database', (): DatabaseConfig => <DatabaseConfig>(getConfig()));