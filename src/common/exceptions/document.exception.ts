import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { ErrorCodes, ErrorMessages } from '../errorCodes';
import { formatString } from '../../helpers/common.helper';

export class DocumentNotFoundException extends BadRequestException {
  constructor(id: string) {
    super({
      code: ErrorCodes.documentNotFound,
      message: formatString(ErrorMessages.documentNotFound, id),
    });
  }
}
