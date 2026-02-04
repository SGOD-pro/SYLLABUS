import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,

  });
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'http://localhost:3000',      // local frontend
      'http://10.5.154.204:3000',      // local frontend
      'http://10.5.146.66:3000',      // local frontend
      'https://yourdomain.com',     // prod frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-clerk-auth',
    ],
    credentials: true,
  });
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  // app.use(bodyParser.json({ limit: '50mb' }));
  // app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
