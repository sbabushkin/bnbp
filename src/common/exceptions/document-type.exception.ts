import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { ErrorCodes, ErrorMessages } from '../errorCodes';
import { formatString } from '../../helpers/common.helper';

export class DocumentTypeNotFoundException extends BadRequestException {
  constructor(id: string) {
    super({
      code: ErrorCodes.documentTypeNotFound,
      message: formatString(ErrorMessages.documentTypeNotFound, id),
    });
  }
}
