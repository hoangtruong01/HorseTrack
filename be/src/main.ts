import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Serve uploads statically ──
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // ── CORS: allow both Web (Next.js) and Mobile (React Native) ──
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.js dev
      'http://localhost:3001', // Next.js alt
      'http://localhost:8081', // React Native / Expo
      'http://localhost:19006', // Expo web
      process.env.CORS_ORIGIN,
    ].filter(Boolean) as string[],
    credentials: true,
  });

  // ── Global API prefix ──
  app.setGlobalPrefix('api/v1');

  // ── Validation ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Interceptors ──
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );

  // ── Exception filter ──
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Swagger ──
  const config = new DocumentBuilder()
    .setTitle('Horse Racing API')
    .setDescription('Horse Racing Tournament Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🚀 Server:    http://localhost:${port}`);
  console.log(`📄 Swagger:   http://localhost:${port}/api/docs`);
  console.log(`🔗 API Base:  http://localhost:${port}/api/v1\n`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
