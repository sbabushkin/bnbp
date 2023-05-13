import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { ErrorCodes, ErrorMessages } from '../errorCodes';

export class PubSubPayloadSizeTooLargeException extends BadRequestException {
  constructor() {
    super({
      code: ErrorCodes.payloadSizeTooLargeException,
      message: ErrorMessages.payloadSizeTooLargeException,
    });
  }
}
