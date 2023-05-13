import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { omit } from 'lodash';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoggedUser } from '../user/entities/loggedUser.entity';
import {
  SmsNotSentException,
  UserWithPhoneNumberNotFoundException, WrongLoginOrPasswordException,
  WrongPhoneNumberOrSmsCodeException,
} from '../common/exceptions';
import { BaseService } from '../common/base.service';
import { Context } from '../common/context';
import { UserEvents } from '../user/events';
import { CacheService } from '../cache/cache.service';
import { SentCodeEntity } from './entities/sent-code.entity';
import { CodeDataStorage } from './code-data.storage';
import { SmsService } from '../sms/sms.service';
import { SmsCConfig } from '../config/base.config';
import { codeGenerator } from '../helpers/common.helper';
import { TokenService } from './token.service';

@Injectable()
export class AuthService extends BaseService {
  private readonly smsCConfig: SmsCConfig;

  private readonly CACHE_PREFIX = 'code-data-storage';

  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly cache: CacheService,
    private readonly smsService: SmsService,
    protected readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super();
    this.smsCConfig = this.configService.get<SmsCConfig>('smsC');
  }

  async validate(email: string, pass: string): Promise<User> {
    const emailStr = email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(emailStr);
    let validated = false;

    if (user) {
      const hashedPassword = await User.hashPassword(user.salt, pass);

      if (hashedPassword === user.pwd) {
        validated = true;
      }
    }

    if (!validated) {
      throw new WrongLoginOrPasswordException();
    }

    return user;
  }

  async validateByPhone(phone: string, code: string): Promise<User> {
    const user = await this.usersService.findByPhone(phone);
    let validated = false;

    if (user) {
      const cacheKey = `${this.CACHE_PREFIX}:${phone}`;
      const cachedCodeData = await this.cache.get(cacheKey);

      if (!cachedCodeData) throw new WrongPhoneNumberOrSmsCodeException();
      const codeData: CodeDataStorage = JSON.parse(cachedCodeData);

      const validationPipeline = [
        new Date() <= new Date(codeData.expiresAt),
        codeData.countOfBadAttempts < 3,
      ];

      if (validationPipeline.some((v) => v === false)) {
        await this.cache.del(cacheKey);
        throw new WrongPhoneNumberOrSmsCodeException();
      }

      if (codeData?.code === code) {
        validated = true;
        await this.cache.del(cacheKey);
      } else {
        codeData.countOfBadAttempts += 1;
        codeData.updatedAt = new Date().toISOString();
        await this.cache.set(`${this.CACHE_PREFIX}:${phone}`, JSON.stringify(codeData));
      }
    }

    if (!validated) {
      throw new WrongPhoneNumberOrSmsCodeException();
    }

    return user;
  }

  @Context()
  public async login(login: string, pass: string, deviceId?: string, isLoginByPhone = false): Promise<LoggedUser> {
    let user;

    if (isLoginByPhone) {
      user = await this.validateByPhone(login, pass);
    } else {
      user = await this.validate(login, pass);
    }

    const payload = {
      id: user.id,
      login: user.login,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      roles: user.roles,
      permissions: user.permissions,
    };

    const tokenPair = await this.tokenService.createTokenPair(user, deviceId);

    this.ctx.user = user;

    await this.emit(UserEvents.USER_LOGGED_IN, omit(user, ['pwd', 'salt']));

    return { ...payload, ...tokenPair };
  }

  @Context()
  public async loginSendCode(phone: string): Promise<SentCodeEntity> {
    const user = await this.usersService.findByPhone(phone);
    if (!user) throw new UserWithPhoneNumberNotFoundException(phone);

    const oldCachedCode = await this.cache.get(`${this.CACHE_PREFIX}:${phone}`);
    if (oldCachedCode) {
      const oldCodeData: CodeDataStorage = JSON.parse(oldCachedCode);

      const timeDiff = new Date().getTime() - new Date(oldCodeData.createdAt).getTime();
      const timeToApproveResend = 60 * 1000;

      if (timeDiff < timeToApproveResend && !this.smsCConfig.isSimulateSending) {
        throw new SmsNotSentException(`${phone}. Повторите через ${Math.floor((timeToApproveResend - timeDiff) / 1000)} сек.`);
      }
    }

    const codeData: CodeDataStorage = {
      code: codeGenerator(4),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (1000 * 60 * 5)).toISOString(),
      countOfBadAttempts: 0,
    };

    if (this.smsCConfig.isSimulateSending) {
      console.log(`SMS code: ${codeData.code}`);
    } else {
      const message = `Код для авторизации: ${codeData.code}`;
      const smsResponse = await this.smsService.sendSMSByPhone(phone, message);
      if (!smsResponse.cnt) throw new SmsNotSentException(phone);
    }

    await this.cache.set(`${this.CACHE_PREFIX}:${phone}`, JSON.stringify(codeData));

    return {
      phone,
      status: true,
    };
  }
}
