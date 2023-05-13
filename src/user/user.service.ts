import { Inject } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { v4 as uuid } from 'uuid';
import { omit } from 'lodash';
import * as crypto from 'crypto';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { BaseService } from '../common/base.service';
import { Context } from '../common/context';
import { PermissionEnum } from '../permission/permission.enum';
import {
  InvalidRecoverPasswordRequestIdException,
  UserNotFoundException,
  UserWithEmailAlreadyExistsException,
  UserWithEmailNotFoundException,
  UserWithPhoneAlreadyExistsException, UserWithPhoneNumberNotFoundException,
} from '../common/exceptions';
import { UserStatusEnum } from './user.enum';
import { EMAIL_SERVICE, IEmailService } from '../email/email.service';
import { SendEmailInput } from '../email/dto/send-email.input';
import { ICacheService } from '../cache/cache.service';
import { CheckRecoveryHashInput, UpdatePasswordInput } from './dto/update-password.input';
import { getOrThrow } from '../util/guards';
import { AuthConfig, MainConfig } from '../config/base.config';
import { UserEvents } from './events';
import { InjectCache } from '../cache/decorators/inject-cache.decorator';

export class UserService extends BaseService {
  constructor(
    @InjectCache()
    private readonly cacheService: ICacheService,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {
    super();
  }

  private buildRecoverPasswordCacheKey(email: string): string {
    return `recoverPassword-${email}`;
  }

  @Context()
  async create(createUserInput: CreateUserInput): Promise<User> {
    const { date, trx } = this.ctx;

    const email = createUserInput.email.trim().toLowerCase();
    let phone = createUserInput.phone.trim().replace(/[^\d]/g, '');
    if (phone.length < 11) phone = null;

    await this.checkUserWithPhoneDoesntExist(phone);
    await this.checkUserWithEmailDoesntExist(email);

    if (!createUserInput.roleIds.length) {
      throw new BadRequestException('Нужно указать роль при создании пользователя');
    }

    if (!this.configService.get<MainConfig>('isLocal')) {
      const requestId = await uuid();
      const tmp = this.buildRecoverPasswordCacheKey(email);
      await this.cacheService.setFields(
        tmp,
        { requestId, attempts: '0' },
      );
      await this.emailService.sendEmail(new SendEmailInput({
        subject: 'Ваша ссылка для создания пароля',
        recipients: [email],
        html: this.emailService.getSetPasswordEmail(
          requestId,
          email,
          `${createUserInput.lastName} ${createUserInput.firstName}`,
          `${this.configService.get<MainConfig>('mainDomain')}`,
        ),
      }));
    }

    const user = await User.query(trx).insert({
      id: uuid(),
      firstName: createUserInput.firstName,
      middleName: createUserInput.middleName,
      lastName: createUserInput.lastName,
      email: createUserInput.email,
      phone,
      gender: createUserInput.gender,
      login: createUserInput.login || email,
      status: UserStatusEnum.new,
      created: date,
      updated: date,
      passwordSetByUser: false,
      comment: createUserInput.comment,
    }).withGraphFetched('roles');
    await user.$relatedQuery('roles', trx).relate(createUserInput.roleIds);

    const result = await this.findOne(user.id);

    this.emit(UserEvents.USER_CREATED, result);

    return result;
  }

  @Context()
  async findAll(): Promise<User[]> {
    const { trx, user } = this.ctx;

    const query = User.query(trx).withGraphFetched('roles.permissions');

    // just an example how to handle "own" permissions
    if (!user.permissions.has(PermissionEnum.CAN_VIEW_USERS)) {
      query.where('id', user.id);
    }

    return query;
  }

  @Context()
  findOne(id: string): Promise<User> {
    const { trx } = this.ctx;
    return getOrThrow(
      async () => User
        .query(trx)
        .withGraphFetched('roles.permissions')
        .findById(id),
      new UserNotFoundException(id),
    );
  }

  async findByEmail(email: string): Promise<User> {
    const { trx } = this.ctx;
    const user = await User.query(trx)
      .where('email', email)
      .withGraphFetched('roles.[permissions]')
      .first();

    if (!user) {
      throw new UserWithEmailNotFoundException(email);
    }
    return user;
  }

  async findByPhone(phone: string): Promise<User> {
    const { trx } = this.ctx;

    const user = await User.query(trx)
      .where('phone', phone)
      .withGraphFetched('roles.[permissions]')
      .first();

    if (!user) {
      throw new UserWithPhoneNumberNotFoundException(phone);
    }
    return user;
  }

  @Context()
  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const { trx, date } = this.ctx;
    const { roleIds, ...otherUserInput } = updateUserInput;

    const user = await this.findOne(id);

    const patchData = {
      ...otherUserInput,
      updated: date,
    };

    if (updateUserInput.phone) {
      const phone = updateUserInput.phone.trim().replace(/[^\d]/g, '');
      if (user.phone !== phone) {
        await this.checkUserWithPhoneDoesntExist(phone);
        patchData.phone = phone;
      }
      if (phone.length < 11) patchData.phone = null;
    }

    if (updateUserInput.email) {
      const email = updateUserInput.email.trim()
        .toLowerCase();
      if (email && user.email !== email) {
        await this.checkUserWithEmailDoesntExist(email);

        if (!this.configService.get<MainConfig>('isLocal')) {
          await this.emailService.sendEmail(new SendEmailInput({
            subject: 'Ваша почта изменена',
            recipients: [email],
            html: this.emailService.getChangeEmail(
              `${this.configService.get<MainConfig>('mainDomain')}`,
              email,
              `${updateUserInput.lastName} ${updateUserInput.firstName}`,
            ),
          }));
        }

        patchData.email = email;
        this.emit(UserEvents.USER_EMAIL_HAS_CHANGED, patchData);
      }
    }

    const updatedUser = await User
      .query(trx)
      .patchAndFetchById(id, patchData)
      .withGraphFetched('roles');

    if (updateUserInput.roleIds) {
      await updatedUser.$relatedQuery('roles', trx).unrelate().where('user_id', updateUserInput.id);
      await updatedUser.$relatedQuery('roles', trx).relate(updateUserInput.roleIds);
    }

    const result = await this.findOne(updatedUser.id);

    this.emit(UserEvents.USER_UPDATED, omit(result, ['salt', 'pwd']));

    return result;
  }

  @Context()
  remove(id: string): Promise<User> {
    const { trx } = this.ctx;
    return getOrThrow(
      async () => User
        .query(trx)
        .where('id', id)
        .delete()
        .returning('*')
        .first(),
      new UserNotFoundException(id),
      true,
    );
  }

  public async checkRecoveryHashInner(input: CheckRecoveryHashInput): Promise<boolean> {
    const cacheKey = this.buildRecoverPasswordCacheKey(input.email);
    const [cachedRequestId, attempts] = await this.cacheService.getFields(cacheKey, ['requestId', 'attempts']);
    const config = this.configService.get<AuthConfig>('auth');

    if (cachedRequestId) {
      if (+attempts + 1 === +config.recoveryAttempts) {
        await this.cacheService.del(cacheKey);
      } else {
        await this.cacheService.incrementFieldBy(cacheKey, 'attempts', 1);
      }

      return input.requestId === cachedRequestId;
    }

    return false;
  }

  @Context()
  public async checkRecoveryHash(input: CheckRecoveryHashInput): Promise<boolean> {
    return this.checkRecoveryHashInner(input);
  }

  @Context()
  public async sendRecoverPasswordEmail(email: string): Promise<void> {
    const user = await this.findByEmail(email); // проверяем, что есть такой
    const requestId = await uuid();
    await this.cacheService.setFields(
      this.buildRecoverPasswordCacheKey(email),
      { requestId, attempts: '0' },
    );

    await this.emailService.sendEmail(new SendEmailInput({
      subject: 'Запрос на смену пароля',
      recipients: [email],
      html: this.emailService.getRecoverPasswordEmail(
        requestId,
        email,
        `${user.lastName} ${user.firstName}`,
        `${this.configService.get<MainConfig>('mainDomain')}`,
      ),
    }));
  }

  @Context()
  public async updatePassword(input: UpdatePasswordInput): Promise<User> {
    const { trx, date } = this.ctx;

    // TODO Проверить ограничения на пароль (кол-во символов, каких и пр.)
    const isValidHash = await this.checkRecoveryHashInner(input);
    if (!isValidHash) {
      throw new InvalidRecoverPasswordRequestIdException();
    }

    let user = await this.findByEmail(input.email);
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await User.hashPassword(salt, input.pwd);

    user = await User.query(trx).patchAndFetchById(user.id, {
      passwordSetByUser: true,
      updated: date,
      pwd: hashedPassword,
      salt,
    });

    await this.emailService.sendEmail(new SendEmailInput({
      subject: 'Пароль успешно изменен',
      recipients: [input.email],
      html: this.emailService.getPasswordSetEmail(),
    }));

    await this.cacheService.del(this.buildRecoverPasswordCacheKey(input.email));

    return user;
  }

  private async checkUserWithPhoneDoesntExist(phone: string): Promise<void> {
    const { trx } = this.ctx;
    const user = await User.query(trx).where('phone', phone).first();
    if (user) {
      throw new UserWithPhoneAlreadyExistsException();
    }
  }

  private async checkUserWithEmailDoesntExist(email: string): Promise<void> {
    const { trx } = this.ctx;
    const user = await User.query(trx).where('email', email).first();
    if (user) {
      throw new UserWithEmailAlreadyExistsException();
    }
  }
}
