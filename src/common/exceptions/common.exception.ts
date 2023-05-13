import { NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { formatString } from '../../helpers/common.helper';
import { ErrorCodes, ErrorMessages } from '../errorCodes';
import { CommentEntityTypeEnum } from '../../comment/comment.enum';

export class WrongDateInterval extends NotFoundException {
  constructor() {
    super({
      code: ErrorCodes.wrongDateInterval,
      message: ErrorMessages.wrongDateInterval,
    });
  }
}

export class ContractNotFoundException extends BadRequestException {
  constructor(id: string) {
    super({
      code: ErrorCodes.contractNotFound,
      message: formatString(ErrorMessages.contractNotFound, id),
    });
  }
}

export class EntityNotFoundException extends BadRequestException {
  constructor(type: CommentEntityTypeEnum, id: string) {
    super({
      code: ErrorCodes.entityNotFound,
      message: formatString(ErrorMessages.entityNotFound, type, id),
    });
  }
}
