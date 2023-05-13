import {
  ObjectType, PartialType, Field, OmitType,
} from '@nestjs/graphql';

@ObjectType()
export class DeleteRoomWorkSiteTaskDiff {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  type: string;
}

@ObjectType()
export class ApproveRoomWorkSiteTaskDiff {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  type: string;

  @Field({ nullable: true })
  approvedUserId?: string;
}

// project diffs
@ObjectType()
export class CreateProjectDiff {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  type: string;
}

