import { DataSource } from "typeorm";
import { dirname } from 'path';
import { configDotenv } from "dotenv";

configDotenv();

const __filename = new URL(import.meta.url);
const __dirname = dirname(__filename.pathname);

const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [
        __dirname + '/**/*.entity{.ts,.js}',
    ],
    migrations: [
        __dirname + '/database/migration/**/*{.ts,.js}',
    ],
    synchronize: false,
});

export default AppDataSource;