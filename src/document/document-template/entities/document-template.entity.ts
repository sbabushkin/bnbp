import { ObjectType, Field } from '@nestjs/graphql';
import { Model } from 'objection';
import BaseModel from '../../../common/base.model';
import { User } from '../../../user/entities/user.entity';
import { DocumentType } from '../../document-type/entities/document-type.entity';
import { File } from '../../../file/entities/file.entity';

@ObjectType()
export class DocumentTemplate extends BaseModel {
  static get tableName() {
    return 'document_template';
  }

  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  documentTypeId: string;

  @Field(() => DocumentType)
  documentType: DocumentType;

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
        documentTypeId: { type: 'string' },
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
          from: 'document_template.author_id',
          to: 'user.id',
        },
      },
      documentType: {
        relation: Model.BelongsToOneRelation,
        modelClass: DocumentType,
        join: {
          from: 'document_template.document_type_id',
          to: 'document_type.id',
        },
      },
      file: {
        relation: Model.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'document_template.file_id',
          to: 'file.id',
        },
      },
    };
  }
}
