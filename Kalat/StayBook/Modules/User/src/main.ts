import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, LogLevel } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule);
  const config = app.get(ConfigService);

  app.useLogger(
    new ConsoleLogger({
      compact: 1,
      prefix: 'User',
      logLevels: config.get('LOG_LEVEL', 'log').split(',') as LogLevel[],
    }),
  );
}

bootstrap();
