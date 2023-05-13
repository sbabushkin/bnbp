import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { LoggedUser } from '../user/entities/loggedUser.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('auth.jwt.secret'),
    });
  }

  async validate(payload: LoggedUser) {
    // TODO: no idea but by some reason could not inject and use service here
    const user = await User.query()
      .withGraphFetched('roles.permissions')
      .findById(payload.id);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return { ...user, permissions: user.permissions };
  }
}
