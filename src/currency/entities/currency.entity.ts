import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import BaseModel from '../../common/base.model';

@ObjectType('CurrencyRateType')
export class CurrencyRate extends BaseModel {
  static get tableName() {
    return 'currency_rate';
  }

  @Field(() => Int)
  id: number;

  @Field()
  from: string;

  @Field()
  to: string;

  @Field(() => Float)
  amount: number;

  @Field()
  created: string;

}
