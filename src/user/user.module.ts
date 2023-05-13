import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '../cache/cache.module';
import { EmailModule } from '../email/email.module';

@Module({
  providers: [UserResolver, UserService],
  imports: [
    DatabaseModule,
    EmailModule,
    CacheModule,
  ],
  exports: [UserService],
})
export class UserModule {}
