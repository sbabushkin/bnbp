import { FactoryProvider, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EMAIL_SERVICE, EmailService, IEmailService, StubEmailService,
} from './email.service';
import { TestConfig } from '../config/base.config';

const factory: FactoryProvider<IEmailService> = {
  provide: EMAIL_SERVICE,
  useFactory: (configService: ConfigService) => {
    const config = configService.get<TestConfig>('testConfig');
    if (config.isTest) return new StubEmailService();
    return new EmailService(configService);
  },
  inject: [ConfigService],
};

@Module({
  providers: [factory],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {
}
