import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsCConfig } from '../config/base.config';
import { BaseService } from '../common/base.service';
import { SmsCSuccessResponseEntity } from './sms-c-response.entity';

@Injectable()
export class SmsService extends BaseService {
  private readonly smsCConfig: SmsCConfig;

  constructor(
    private readonly httpService: HttpService,
    protected readonly configService: ConfigService,
  ) {
    super();
    this.smsCConfig = this.configService.get<SmsCConfig>('smsC');
  }

  async sendSMSByPhone(phoneNumber: string, message: string): Promise<SmsCSuccessResponseEntity> {
    const { login, password, sender } = this.smsCConfig;

    const params = {
      login,
      psw: password,
      phones: phoneNumber,
      mes: message,
      sender,
      fmt: 3,
    };

    const { data: result } = await this.httpService
      .get('/send.php', { params, baseURL: this.smsCConfig.url })
      .toPromise();

    return result;
  }
}
