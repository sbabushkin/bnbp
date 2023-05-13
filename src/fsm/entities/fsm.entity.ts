import { Field, ObjectType } from '@nestjs/graphql';
import { Model } from 'objection';
import BaseModel from '../../common/base.model';
import { FsmTransition } from './fsm-transition.entity';
import { FsmTypeEnum } from '../fsm-type.enum';

@ObjectType()
export class Fsm extends BaseModel {
  static get tableName() {
    return 'fsm';
  }

  @Field()
  id: string;

  @Field()
  fsmType: FsmTypeEnum;

  @Field()
  entityId: string;

  @Field()
  created: string;

  @Field()
  updated: string;

  @Field(() => [FsmTransition])
  fsmTransitions: FsmTransition[];

  static get relationMappings() {
    return {
      fsmTransitions: {
        relation: Model.HasManyRelation,
        modelClass: FsmTransition,
        join: {
          from: `${Fsm.tableName}.id`,
          to: `${FsmTransition.tableName}.fsm_id`,
        },
      },
    };
  }
}
