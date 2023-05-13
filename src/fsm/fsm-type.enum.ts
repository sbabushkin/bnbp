import { registerEnumType } from '@nestjs/graphql';

export enum FsmTypeEnum {
  projectTasks = 'projectTasks',
}

registerEnumType(FsmTypeEnum, {
  name: 'FsmTypeEnum',
});
