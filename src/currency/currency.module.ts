import { HttpModule, Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    CurrencyService,
    CurrencyController,
  ],
  controllers: [CurrencyController],
  exports: [CurrencyService],
})
export class CurrencyModule {
}
