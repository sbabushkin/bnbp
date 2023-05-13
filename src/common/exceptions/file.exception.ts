import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { ErrorCodes, ErrorMessages } from '../errorCodes';
import { formatString } from '../../helpers/common.helper';

export class FileNotFoundException extends BadRequestException {
  constructor(id: string) {
    super({
      code: ErrorCodes.fileNotFound,
      message: formatString(ErrorMessages.fileNotFound, id),
    });
  }
}

export class FileCannotGetPreviewException extends BadRequestException {
  constructor(id: string) {
    super({
      code: ErrorCodes.fileCannotGetPreview,
      message: formatString(ErrorMessages.fileCannotGetPreview, id),
    });
  }
}
