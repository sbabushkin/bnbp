import { InputType, Field } from '@nestjs/graphql';
import { CommentEntityTypeEnum } from '../comment.enum';

@InputType()
export class CreateCommentInput {
  @Field({ nullable: true })
  parentId?: string;

  @Field(() => CommentEntityTypeEnum)
  entityType: CommentEntityTypeEnum;

  @Field()
  entityId: string;

  @Field()
  body: string;

  @Field(() => [String], { nullable: true })
  attachmentIds?: string[];
}
