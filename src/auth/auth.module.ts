import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { CacheModule } from '../cache/cache.module';
import { EmailModule } from '../email/email.module';
import { CacheService } from '../cache/cache.service';
import { SmsModule } from '../sms/sms.module';
import { TokenService } from './token.service';
import {RedisModule} from 'nest-module-redis/index';
import {redisConfig} from '../config/redis.config';
import { FileController } from "../file/file.controller";
import { AuthController } from "./auth.controller";

// module
@Module({
  imports: [
    UserModule,
    PassportModule,
    CacheModule,
    EmailModule,
    SmsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, TokenService, AuthController],
  controllers: [AuthController],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
