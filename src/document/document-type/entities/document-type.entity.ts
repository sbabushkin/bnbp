import { ObjectType, Field } from '@nestjs/graphql';
import BaseModel from '../../../common/base.model';
import { DocumentTypeContextEntityTypeEnum } from '../document-type-context.enum';

@ObjectType()
export class DocumentType extends BaseModel {
  static get tableName() {
    return 'document_type';
  }

  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => DocumentTypeContextEntityTypeEnum)
  context: DocumentTypeContextEntityTypeEnum;

  @Field()
  created: string;

  @Field()
  updated: string;

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        context: { type: 'string' },
        created: { type: 'string' },
        updated: { type: 'string' },
      },
    };
  }
}
