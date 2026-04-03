import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // All routes prefixed with /api
  app.setGlobalPrefix('api');

  // Auto-validate all request bodies
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown fields
      forbidNonWhitelisted: true,
      transform: true, // auto-convert types (string "1" → number 1)
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS — allow Angular frontend
  app.enableCors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:4200'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Swagger API docs at http://localhost:3333/api/docs
  const config = new DocumentBuilder()
    .setTitle('LastMinPrep API')
    .setDescription('Backend API for LastMinPrep platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3333);
  console.log(`🚀 Server running on http://localhost:3333`);
  console.log(`📖 API docs at http://localhost:3333/api/docs`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
