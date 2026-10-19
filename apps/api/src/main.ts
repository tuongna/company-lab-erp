import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import pinoHttp from 'pino-http';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Structured HTTP logging (ADR-0002, T4)
  app.use(
    pinoHttp({
      autoLogging: {
        ignore: (req) =>
          Boolean(req.url && (req.url === '/api/docs' || req.url.startsWith('/api/docs/'))),
      },
    }),
  );

  // Global Exception Filters (T1: Map DB constraint errors to 409)
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  // CORS configuration (T2)
  const corsOriginEnv = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';
  const corsOrigins = corsOriginEnv.includes(',')
    ? corsOriginEnv.split(',').map((o) => o.trim())
    : corsOriginEnv === '*'
      ? true
      : corsOriginEnv;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('CompanyLab ERP API')
    .setDescription('CompanyLab Internal Operations ERP API - IT Asset Allocation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api/docs`);
}
bootstrap();
