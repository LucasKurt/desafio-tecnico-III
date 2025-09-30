import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CpfExceptionFilter } from './common/filters/cpf-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new CpfExceptionFilter());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Desafio Técnico III - API')
    .setDescription('Pacientes & Exames (idempotência, DICOM, paginação)')
    .setVersion('1.0.0')
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
