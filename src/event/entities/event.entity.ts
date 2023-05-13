import {
  Field, ObjectType, createUnionType,
} from '@nestjs/graphql';
import BaseModel from '../../common/base.model';
// import {
//   DeleteRoomWorkSiteTaskDiff,
//   CreateProjectDiff,
//   ApproveRoomWorkSiteTaskDiff,
// } from '../dto/event-payload';

// const DiffUnion = createUnionType({
//   name: 'DiffUnion',
//   types: () => [
//     CreateRoomWorkSiteTaskDiff,
//     UpdateRoomWorkSiteTaskDiff,
//     UpdateTaskStatusDiff,
//     DeleteRoomWorkSiteTaskDiff,
//     CreateProjectDiff,
//     UpdateProjectDiff,
//     ApproveRoomWorkSiteTaskDiff,
//   ],
//   resolveType(value) {
//     switch (value.type) {
//         return RoomWorkSiteTask;
//     }
//   },
// });

@ObjectType()
export class Event extends BaseModel {
  static get tableName() {
    return 'event';
  }

  @Field()
  id: string;

  @Field({ nullable: true })
  entityId?: string;

  @Field({ nullable: true })
  aggregateId?: string;

  @Field()
  type: string;

  @Field()
  created: string;

  @Field({ nullable: true })
  userId?: string;

  // @Field(() => DiffUnion, { nullable: true })
  // diff?: typeof DiffUnion;
}
