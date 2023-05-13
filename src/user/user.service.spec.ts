import { TestingModule } from '@nestjs/testing';
import { isEqual } from 'lodash';
import { UserService } from './user.service';
import {
  executionTimeout,
  prepareTestingModule,
  TypedRemover,
  updateString,
} from '../test/helper';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './entities/user.entity';
import { UserGenderEnum, UserStatusEnum } from './user.enum';
import { UserNotFoundException } from '../common/exceptions';
import { UpdateUserInput } from './dto/update-user.input';
import { codeGenerator } from '../helpers/common.helper';

const getService = async function (module: TestingModule): Promise<UserService> {
  return module.resolve<UserService>(UserService);
};

function createInput(): CreateUserInput {
  return {
    firstName: 'firstName',
    lastName: 'lastName',
    middleName: 'middleName',
    login: 'login',
    email: 'email',
    phone: codeGenerator(11),
    gender: UserGenderEnum.male,
    roleIds: [1],
  };
}

export const createUser = async function (
  module: TestingModule,
  input: CreateUserInput,
): Promise<[User, TypedRemover<User>]> {
  const service = await getService(module);
  const createdValue = await service.create(input);
  return [
    createdValue,
    async () => {
      const service = await getService(module);
      return service.remove(createdValue.id);
    },
  ];
};

export const createUserWithValues = async function (
  module: TestingModule,
): Promise<[CreateUserInput, User, TypedRemover<User>]> {
  const input = createInput();
  const [createdValue, remover] = await createUser(module, input);

  return [input, createdValue, remover];
};

describe('UserService', () => {
  let module: TestingModule;
  prepareTestingModule((value: TestingModule) => {
    module = value;
  });

  it('user crud', async () => {
    const [createInput, createdValue, remover] = await createUserWithValues(module);
    expect(createdValue).toBeDefined();
    expect(createdValue.id).toBeDefined();
    expect(createdValue.firstName).toEqual(createInput.firstName);
    expect(createdValue.lastName).toEqual(createInput.lastName);
    expect(createdValue.middleName).toEqual(createInput.middleName);
    expect(createdValue.login).toEqual(createInput.login);
    expect(createdValue.email).toEqual(createInput.email);
    expect(createdValue.phone).toEqual(createInput.phone);
    expect(createdValue.gender).toEqual(createInput.gender);
    expect(createdValue.status).toEqual(UserStatusEnum.new);
    expect(isEqual(
      createInput.roleIds.sort(),
      createdValue.roles.map((s) => s.id).sort(),
    )).toBeTruthy();
    expect(createdValue.passwordSetByUser).toBeFalsy();
    expect(createdValue.created).toBeDefined();
    expect(createdValue.updated).toBeDefined();

    let service = await getService(module);
    const dbValue = await service.findOne(createdValue.id);
    expect(createdValue.id).toEqual(dbValue.id);

    const updateInput: UpdateUserInput = {
      id: createdValue.id,
      firstName: updateString(createdValue.firstName),
      lastName: updateString(createdValue.lastName),
      middleName: updateString(createdValue.middleName),
      login: updateString(createdValue.login),
      email: updateString(createdValue.email),
      phone: updateString(createdValue.phone),
      gender: UserGenderEnum.female,
      roleIds: [1],
      status: UserStatusEnum.new,
    };
    service = await getService(module);
    const updatedValue = await service.update(updateInput.id, updateInput);

    expect(updatedValue.id).toEqual(updateInput.id);
    expect(updatedValue.firstName).toEqual(updateInput.firstName);
    expect(updatedValue.lastName).toEqual(updateInput.lastName);
    expect(updatedValue.middleName).toEqual(updateInput.middleName);
    expect(updatedValue.login).toEqual(updateInput.login);
    expect(updatedValue.email).toEqual(updateInput.email);
    expect(updatedValue.phone).toEqual(updateInput.phone);
    expect(updatedValue.gender).toEqual(updateInput.gender);

    const removedValue = await remover();
    expect(createdValue.id).toEqual(removedValue.id);

    service = await getService(module);
    await expect(async () => service.findOne(createdValue.id))
      .rejects
      .toThrowError(UserNotFoundException);
  }, executionTimeout);
});
