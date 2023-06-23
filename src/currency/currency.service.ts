import { Injectable, Scope, HttpService} from '@nestjs/common';
import { BaseService } from '../common/base.service';
import { CurrencyRate } from './entities/currency.entity';
import { ConfigService } from "@nestjs/config";
import { CacheService } from "../cache/cache.service";


const apikey = 'fYk8v1ThAejllghWN8c0Y2p613Oj9W6L'; // TODO: move to config
const baseApiUrl = 'https://api.apilayer.com/exchangerates_data/convert';

export const CURRENCY_SERVICE = 'CURRENCY_SERVICE';

@Injectable({ scope: Scope.REQUEST })
export class CurrencyService extends BaseService {

  constructor(
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async update(): Promise<any> {
    const usdResponse = await this.httpService.get(
      `${baseApiUrl}?from=USD&to=IDR&amount=1`,
      {
        headers: {
          apikey,
        },
      },
    ).toPromise();

    const idrResponse = await this.httpService.get(
      `${baseApiUrl}?from=IDR&to=USD&amount=1`,
      {
        headers: {
          apikey,
        },
      },
    ).toPromise();

    const data = [
      {
        from: 'USD',
        to: 'IDR',
        amount: usdResponse.data.result,
        created: (new Date()).toISOString(),
      },
      {
        from: 'IDR',
        to: 'USD',
        amount: idrResponse.data.result,
        created: (new Date()).toISOString(),
      },
    ];

    await CurrencyRate.query().insert(data);

    return usdResponse.data;
  }

}
