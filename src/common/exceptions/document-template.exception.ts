import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { ErrorCodes, ErrorMessages } from '../errorCodes';
import { formatString } from '../../helpers/common.helper';

export class DocumentTemplateNotFoundException extends BadRequestException {
  constructor(id: string) {
    super({
      code: ErrorCodes.documentTemplateNotFound,
      message: formatString(ErrorMessages.documentTemplateNotFound, id),
    });
  }
}
