import { Mutation, Resolver } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PubSubEngine } from 'graphql-subscriptions/dist/pubsub-engine';
import { UserLoginInput } from '../user/dto/login-user.input';
import { LoggedUser } from '../user/entities/loggedUser.entity';
import { AuthService } from './auth.service';
import { PUBSUB } from '../pubsub/pubsub.module';
import { UserLoginByPhoneInput } from '../user/dto/login-user-by-phone.input';
import { SentCodeEntity } from './entities/sent-code.entity';
import { UserLoginSendCodeInput } from '../user/dto/login-user-send-code.input';
import { TokenPairType } from './token-pair.type';
import { TokenService } from './token.service';
import { InputArg } from '../util/graphql/decorators';
import { RefreshTokensInput } from './dto/refreshAccessToken.input';

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    @Inject(PUBSUB) private pubSub: PubSubEngine,
    private readonly tokenService: TokenService,
  ) {}

  @Mutation(() => LoggedUser)
  async loginUser(
    @InputArg(UserLoginInput) input: UserLoginInput,
  ): Promise<LoggedUser> {
    return this.authService.login(input.email, input.password, input.deviceId);
  }

  @Mutation(() => LoggedUser)
  async loginUserByPhone(
    @InputArg(UserLoginByPhoneInput) input: UserLoginByPhoneInput,
  ): Promise<LoggedUser> {
    return this.authService.login(input.phone, input.code, input.deviceId, true);
  }

  @Mutation(() => SentCodeEntity)
  async loginSendCode(
    @InputArg(UserLoginSendCodeInput) input: UserLoginSendCodeInput,
  ): Promise<SentCodeEntity> {
    return this.authService.loginSendCode(input.phone);
  }

  @Mutation(() => TokenPairType)
  async refreshTokens(@InputArg(RefreshTokensInput) input: RefreshTokensInput): Promise<TokenPairType> {
    return this.tokenService.refreshTokens(input);
  }
}
