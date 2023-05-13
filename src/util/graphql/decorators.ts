import { Args, BaseTypeOptions, Int } from '@nestjs/graphql';
import { GraphQLUUID } from 'graphql-scalars';
import { ArgsOptions } from '@nestjs/graphql/dist/decorators/args.decorator';

export function InputArg<T>(
  type: T,
  options?: BaseTypeOptions,
): ParameterDecorator {
  return Args({ name: 'input', type: () => type, ...options });
}

export function IdArg(
  options?: BaseTypeOptions,
): ParameterDecorator {
  return Args({ name: 'id', type: () => Int, ...options });
}

export function UUIDArg(
  options?: ArgsOptions,
): ParameterDecorator {
  return Args({ name: 'id', type: () => GraphQLUUID, ...options });
}

export function ProjectUUIDArg(options?: BaseTypeOptions) {
  return Args({
    name: 'projectId',
    type: () => String,
    description: 'Id of the project whose work is being synchronized',
    ...options,
  });
}
