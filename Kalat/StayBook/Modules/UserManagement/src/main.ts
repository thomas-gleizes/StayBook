import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { SERVICE_FQN } from './core/config/constants';
import { environment } from './core/config/environment';
import { KafkaRunner } from './core/kafka/kafka.runner';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: new ConsoleLogger({
      prefix: SERVICE_FQN,
      logLevels: environment.LOG_LEVEL,
    }),
  });
  const logger = new Logger('Main');
  const runner = app.get(KafkaRunner);

  await app.init();
  logger.log('Application initialized');

  await runner.listen();
  logger.log('Application started');
}

bootstrap();
