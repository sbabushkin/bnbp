import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { ApplicationStatusReturnType } from './dto/applicationStatus';
import { ApplicationStatusService } from './applicationStatus.service';

@Resolver(() => ApplicationStatusReturnType)
@UseGuards(JwtAuthGuard)
export class ApplicationStatusResolver {
  constructor(private readonly applicationStatusService: ApplicationStatusService) {}

  @Query(() => ApplicationStatusReturnType)
  getApplicationStatus(): ApplicationStatusReturnType {
    return this.applicationStatusService.getApplicationStatus();
  }
}
