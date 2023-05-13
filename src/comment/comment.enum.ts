import { registerEnumType } from '@nestjs/graphql';
import BaseModel from '../common/base.model';

// TODO: rename to EntityTypeEnum?
export enum CommentEntityTypeEnum {
  task = 'task',
  executor = 'executor',
  skill = 'skill',
  workTemplate = 'workTemplate',
}

const classMap: Map<CommentEntityTypeEnum, typeof BaseModel> = new Map();
// classMap.set(CommentEntityTypeEnum.task, RoomWorkSiteTask);

export const entityTypeClassMap = classMap;

registerEnumType(CommentEntityTypeEnum, {
  name: 'CommentEntityTypeEnum',
});
