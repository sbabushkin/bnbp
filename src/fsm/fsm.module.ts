import { Module } from '@nestjs/common';
import { FsmService } from './fsm.service';

@Module({
  providers: [FsmService],
  exports: [FsmService],
})
export class FsmModule {}
