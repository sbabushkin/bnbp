import { ObjectType, Field } from '@nestjs/graphql';
import { Model } from 'objection';
import BaseModel from '../../../common/base.model';
import { User } from '../../../user/entities/user.entity';
import { DocumentTemplate } from '../../document-template/entities/document-template.entity';
import { File } from '../../../file/entities/file.entity';

@ObjectType()
export class Document extends BaseModel {
  static get tableName() {
    return 'document';
  }

  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  documentTemplateId: string;

  @Field()
  fileId: string;

  @Field()
  authorId: string;

  @Field()
  created: string;

  @Field()
  updated: string;

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'string' },
        authorId: { type: 'string' },
        documentTemplateId: { type: 'string' },
        description: { type: 'string' },
        fileId: { type: 'string' },
        name: { type: 'string' },
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
          from: 'document.author_id',
          to: 'user.id',
        },
      },
      documentTemplate: {
        relation: Model.BelongsToOneRelation,
        modelClass: DocumentTemplate,
        join: {
          from: 'document.document_template_id',
          to: 'document_template.id',
        },
      },
      file: {
        relation: Model.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'document.file_id',
          to: 'file.id',
        },
      },
    };
  }
}
