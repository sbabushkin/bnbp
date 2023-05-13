import { ForbiddenException } from '@nestjs/common';
import { ErrorCodes, ErrorMessages } from '../errorCodes';
import { formatString } from '../../helpers/common.helper';

export class TenantForbidden extends ForbiddenException {
  constructor() {
    super({
      code: ErrorCodes.tenantForbidden,
      message: formatString(ErrorMessages.tenantForbidden),
    });
  }
}
