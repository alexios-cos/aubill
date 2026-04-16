import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { KernelModule } from "./kernel/kernel.module.js";
import { ConfigService } from "@nestjs/config";
import { EnvironmentConfig } from "./kernel/config/environment.config.js";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";

async function bootstrapSwagger(app: INestApplication) {
    const apiConfig = new DocumentBuilder()
        .setTitle('Aubill API')
        .setDescription('Aubill API list of endpoints')
        .setVersion('1.0.0')
        .addServer('http://localhost:3000/api/v1')
        .addCookieAuth(
            'Authentication',
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                in: 'Header',
                name: 'Authentication',
                description: 'Paste access token here',
            }
        )
        .addSecurityRequirements('Bearer')
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, apiConfig);

    SwaggerModule.setup(
        'api-docs',
        app,
        documentFactory,
        {
            swaggerOptions: {
                persistAuthorization: true,
                withCredentials: true,
            },
        }
    );
}

async function bootstrap() {
    const app = await NestFactory.create(KernelModule);

    const configService = app.get<ConfigService>(ConfigService);
    const environmentConfig = configService.get<EnvironmentConfig>('environment') as EnvironmentConfig;

    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await bootstrapSwagger(app);

    await app.listen(environmentConfig.webPort);
}

void bootstrap();
