import {
  Controller, Res, Post, Body
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginInput } from "../user/dto/login-user.input";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('/login')
  async download(@Body() input: UserLoginInput, @Res() res: any) {
    const { password, email, deviceId } = input;
    return this.authService.login(email, password, deviceId, false);
  }
}
