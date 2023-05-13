import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { PubSubEngine } from 'graphql-subscriptions/dist/pubsub-engine';
import { AppModule } from './app.module';
// import { PUBSUB } from './pubsub/pubsub.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => new BadRequestException(errors, 'Ошибка валидации'),
  }));

  // const pubSub = app.get<PubSubEngine>(PUBSUB);
  // await pubSub.publish('INIT', {}); // test publish to check connection

  const config = app.get(ConfigService);
  const port = config.get('port');

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
