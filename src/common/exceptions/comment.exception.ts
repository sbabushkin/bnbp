import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { ErrorCodes, ErrorMessages } from '../errorCodes';
import { formatString } from '../../helpers/common.helper';

export class CommentNotFoundException extends BadRequestException {
  constructor(id: string) {
    super({
      code: ErrorCodes.commentNotFound,
      message: formatString(ErrorMessages.commentNotFound, id),
    });
  }
}

export class CommentFailedToCreateException extends BadRequestException {
  constructor() {
    super({
      code: ErrorCodes.commentFailedToCreate,
      message: formatString(ErrorMessages.commentFailedToCreate),
    });
  }
}
