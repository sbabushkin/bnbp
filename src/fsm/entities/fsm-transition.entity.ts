import { Field, ObjectType } from '@nestjs/graphql';
import { Model } from 'objection';
import BaseModel from '../../common/base.model';
import { Fsm } from './fsm.entity';

@ObjectType()
export class FsmTransition extends BaseModel {
  static get tableName() {
    return 'fsm_transition';
  }

  @Field()
  id: string;

  @Field()
  fsmId: string;

  @Field()
  from: string;

  @Field()
  to: string;

  @Field(() => [String])
  requiredFields: string[];

  static get relationMappings() {
    return {
      fsm: {
        relation: Model.BelongsToOneRelation,
        modelClass: Fsm,
        join: {
          from: `${FsmTransition.tableName}.fsm_id`,
          to: `${Fsm.tableName}.id`,
        },
      },
    };
  }
}
