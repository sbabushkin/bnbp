import { ObjectType, Field } from '@nestjs/graphql';
import { Model } from 'objection';
import BaseModel from '../../common/base.model';
import { CommentEntityTypeEnum } from '../comment.enum';
import { User } from '../../user/entities/user.entity';
import { File } from '../../file/entities/file.entity';

@ObjectType()
export class Comment extends BaseModel {
  static get tableName() {
    return 'comment';
  }

  @Field()
  id: string;

  @Field({ nullable: true })
  parentId?: string;

  @Field()
  authorId: string;

  @Field(() => CommentEntityTypeEnum)
  entityType: CommentEntityTypeEnum;

  @Field()
  entityId: string;

  @Field()
  body: string;

  @Field()
  created: string;

  @Field()
  updated: string;

  @Field(() => [File], { nullable: true })
  attachments?: File[];

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'string' },
        parentId: { type: ['string', null] },
        authorId: { type: 'string' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        body: { type: 'string' },
        created: { type: 'string' },
        updated: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'comment.author_id',
          to: 'user.id',
        },
      },
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Comment,
        join: {
          from: 'comment.parent_id',
          to: 'comment.id',
        },
      },
      attachments: {
        relation: Model.ManyToManyRelation,
        modelClass: File,
        join: {
          from: 'comment.id',
          through: {
            from: 'comment_attachment.comment_id',
            to: 'comment_attachment.file_id',
          },
          to: 'file.id',
        },
      },
    };
  }
}
