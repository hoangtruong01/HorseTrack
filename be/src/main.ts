import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import mongoose from 'mongoose';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { mongooseTransformPlugin } from './common/plugins/mongoose-transform.plugin';

mongoose.plugin(mongooseTransformPlugin);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Security: HTTP headers ──
  app.use(helmet());

  // ── Serve uploads statically ──
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // ── CORS: allow both Web (Next.js) and Mobile (React Native) ──
  const corsOrigins = [
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://localhost:19006',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: corsOrigins,
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
  app.useGlobalInterceptors(new ResponseInterceptor());

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
