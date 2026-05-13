import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Horse Track API')
    .setDescription('The Horse Track API description')
    .setVersion('1.0')
    .addTag('horses')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `\n🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}/api`,
  );
}
bootstrap();
