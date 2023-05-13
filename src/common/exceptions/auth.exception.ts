import { BadRequestException } from '@nestjs/common';
import { ErrorCodes, ErrorMessages } from '../errorCodes';

export class RefreshTokenDoesNotBelongToCurrentDevice extends BadRequestException {
  constructor() {
    super({
      code: ErrorCodes.refreshTokenDoesNotBelongToCurrentDevice,
      message: ErrorMessages.refreshTokenDoesNotBelongToCurrentDevice,
    });
  }
}

export class RefreshTokenExpiredException extends BadRequestException {
  constructor() {
    super({
      code: ErrorCodes.refreshTokenExpired,
      message: ErrorMessages.refreshTokenExpired,
    });
  }
}

export class WrongPayloadInRefreshTokenException extends BadRequestException {
  constructor() {
    super({
      code: ErrorCodes.wrongPayloadInRefreshTokenException,
      message: ErrorMessages.wrongPayloadInRefreshTokenException,
    });
  }
}
