import { Field, ObjectType } from '@nestjs/graphql';
import BaseModel from '../../common/base.model';

@ObjectType('FileType')
export class File extends BaseModel {
  static get tableName() {
    return 'file';
  }

  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  mimetype: string;

  previewId: string;

  @Field()
  created: string;

  @Field()
  updated: string;

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'string' },
        previewId: { type: ['string', 'null'] },
        name: { type: 'string' },
        mimetype: { type: 'string' },
        created: { type: 'string' },
        updated: { type: 'string' },
      },
    };
  }
}
