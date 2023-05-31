import {
  Field, InputType, Int, Float
} from '@nestjs/graphql';

@InputType()
export class UpdatePropertyInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  ownership?: string;

  @Field({ nullable: true })
  propertyType?: string;

  @Field(() => Float, { nullable: true })
  landSize?: number;

  @Field(() => Float,{ nullable: true })
  buildingSize?: number;

  @Field(() => Int,{ nullable: true })
  bedroomsCount?: string;

  @Field(() => Int,{ nullable: true })
  bathroomsCount?: number;

  @Field(() => Float,{ nullable: true })
  priceIdr?: number;

  @Field(() => Float,{ nullable: true })
  priceUsd?: number;
}
