import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/base.service';
import { FsmTypeEnum } from './fsm-type.enum';
import { Fsm } from './entities/fsm.entity';

@Injectable()
export class FsmService extends BaseService {
  async getFsm(fsmType: FsmTypeEnum, entityId: string): Promise<Fsm> {
    const { trx } = this.ctx;
    return Fsm.query(trx)
      .withGraphFetched('fsmTransitions')
      .where({
        fsmType,
        entityId,
      })
      .first();
  }
}
