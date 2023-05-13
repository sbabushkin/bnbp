import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { NotFoundException } from '@nestjs/common';
import { ErrorCodes, ErrorMessages } from '../errorCodes';
import { formatString } from '../../helpers/common.helper';

export class UserWithEmailAlreadyExistsException extends BadRequestException {
  constructor() {
    super({
      code: ErrorCodes.userWithEmailAlreadyExists,
      message: ErrorMessages.userWithEmailAlreadyExists,
    });
  }
}

export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      code: ErrorCodes.userNotFound,
      message: formatString(ErrorMessages.userNotFound, id),
    });
  }
}

export class UserWithEmailNotFoundException extends NotFoundException {
  constructor(email: string) {
    super({
      code: ErrorCodes.userWithEmailNotFound,
      message: formatString(ErrorMessages.userWithEmailNotFound, email),
    });
  }
}

export class UserWithPhoneAlreadyExistsException extends BadRequestException {
  constructor() {
    super({
      code: ErrorCodes.userWithPhoneAlreadyExists,
      message: ErrorMessages.userWithPhoneAlreadyExists,
    });
  }
}

export class InvalidRecoverPasswordRequestIdException extends BadRequestException {
  constructor() {
    super({
      code: ErrorCodes.invalidRecoverPasswordRequestId,
      message: ErrorMessages.invalidRecoverPasswordRequestId,
    });
  }
}

export class RoleNotFoundException extends BadRequestException {
  constructor(roleCode: string) {
    super({
      code: ErrorCodes.roleNotFound,
      message: formatString(ErrorMessages.roleNotFound, roleCode),
    });
  }
}

export class PermissionNotFoundException extends BadRequestException {
  constructor() {
    super({
      code: ErrorCodes.permissionNotFound,
      message: formatString(ErrorMessages.permissionNotFound),
    });
  }
}

export class WrongLoginOrPasswordException extends NotFoundException {
  constructor() {
    super({
      code: ErrorCodes.wrongLoginOrPassword,
      message: ErrorMessages.wrongLoginOrPassword,
    });
  }
}

export class PermissionGroupNotSetForPermissionException extends BadRequestException {
  constructor(roleCode: string) {
    super({
      code: ErrorCodes.permissionGroupNotSetForPermission,
      message: formatString(ErrorMessages.permissionGroupNotSetForPermission, roleCode),
    });
  }
}

export class SkillNotFoundException extends BadRequestException {
  constructor(id: number) {
    super({
      code: ErrorCodes.skillNotFound,
      message: formatString(ErrorMessages.skillNotFound, id),
    });
  }
}

export class SmsNotSentException extends BadRequestException {
  constructor(phone: string) {
    super({
      code: ErrorCodes.smsNotSent,
      message: formatString(ErrorMessages.smsNotSent, phone),
    });
  }
}

export class UserWithPhoneNumberNotFoundException extends NotFoundException {
  constructor(phone: string) {
    super({
      code: ErrorCodes.userWithPhoneNotFound,
      message: formatString(ErrorMessages.userWithPhoneNotFound, phone),
    });
  }
}

export class WrongPhoneNumberOrSmsCodeException extends NotFoundException {
  constructor() {
    super({
      code: ErrorCodes.wrongPhoneNumberOrSmsCode,
      message: formatString(ErrorMessages.wrongPhoneNumberOrSmsCode),
    });
  }
}
