import { Module } from '@nestjs/common';
import { ApplicationStatusService } from './applicationStatus.service';
import { ApplicationStatusResolver } from './applicationStatus.resolver';

@Module({
  providers: [ApplicationStatusResolver, ApplicationStatusService],
})
export class ApplicationStatusModule {}
