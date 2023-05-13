import { Injectable, Scope } from '@nestjs/common';
import { BaseService } from '../common/base.service';
import { Context } from '../common/context';
import { ApplicationStatusReturnType } from './dto/applicationStatus';

@Injectable({ scope: Scope.REQUEST })
export class ApplicationStatusService extends BaseService {
  @Context()
  getApplicationStatus(): ApplicationStatusReturnType {
    const env = this.configService.get('env');
    return {
      isDevelopment: env === 'development',
    };
  }
}
