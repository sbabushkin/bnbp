import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtSignOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import { addSeconds } from 'date-fns';
import { BaseService } from '../common/base.service';
import { User } from '../user/entities/user.entity';
import { RefreshTokenDoesNotBelongToCurrentDevice, RefreshTokenExpiredException, WrongPayloadInRefreshTokenException } from '../common/exceptions/auth.exception';
import { TokenPairType } from './token-pair.type';
import { RefreshTokensInput } from './dto/refreshAccessToken.input';
import { CacheService } from '../cache/cache.service';
import { UserService } from '../user/user.service';

export interface JwtAccessPayload {
  id: string,
  login: string,
  email: string,
  firstName: string,
  lastName: string,
  middleName: string,
}

export interface RefreshTokenPayload {
  userId: string;
  deviceId: string;
  expires: string;
}

export enum StoredEntityType {
  refreshToken = 'refreshToken',
}

@Injectable()
export class TokenService extends BaseService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
    private readonly userService: UserService,
  ) {
    super();
  }

  async createTokenPair(user: User, deviceId?: string): Promise<TokenPairType> {
    const options = {
      expiresIn: this.configService.get('auth.jwt.expiresIn'),
    };

    if (!deviceId) {
      options.expiresIn = this.configService.get('auth.jwt.refreshTokenExpiresIn');
      return {
        accessToken: await this.createAccessToken(
          user,
          options,
        ),
      };
    }

    const refreshToken = await this.createRefreshToken(user, deviceId);

    const accessToken = await this.createAccessToken(
      user,
      options,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Создает access-токен для пользователя
   */
  async createAccessToken(
    user: User,
    options?: JwtSignOptions,
  ): Promise<string> {
    const payload: JwtAccessPayload = {
      id: user.id,
      login: user.login,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
    };

    return this.jwtService.sign(payload, options);
  }

  async createRefreshToken(
    user: User,
    deviceId: string,
    expiration = this.configService.get('auth.jwt.refreshTokenExpiresIn'),
  ): Promise<string> {
    const expires = addSeconds(new Date(), expiration).getTime().toString();
    const input: RefreshTokenPayload = {
      userId: user.id,
      deviceId,
      expires,
    };

    const token = this.jwtService.sign(input, {
      expiresIn: expires,
    });

    const key = this.generateKey(user.id, deviceId, StoredEntityType.refreshToken);

    await this.cacheService.set(key, token);

    return token;
  }

  async refreshTokens(
    input: RefreshTokensInput,
  ): Promise<TokenPairType> {
    const { deviceId, refreshToken } = input;
    const { userId, expires, deviceId: signedDeviceId }: RefreshTokenPayload = this.jwtService.verify<RefreshTokenPayload>(refreshToken);

    if (!userId || !expires || !signedDeviceId) {
      throw new WrongPayloadInRefreshTokenException();
    }

    const expiresDate = new Date(+expires);
    const now = new Date();

    if (expiresDate < now) {
      throw new RefreshTokenExpiredException();
    }

    if (deviceId !== signedDeviceId) {
      throw new RefreshTokenDoesNotBelongToCurrentDevice();
    }

    const user = await this.userService.findOne(userId);

    return this.createTokenPair(user, deviceId);
  }

  private generateKey(userId: string, deviceToken: string, type: StoredEntityType = StoredEntityType.refreshToken): string {
    return `${userId}:${deviceToken}:${type}`;
  }
}
