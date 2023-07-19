import BaseModel from '../../common/base.model';
import { Model } from "objection";
import { PropertyPrice } from "./property_price.entity";
import { Field, ObjectType, Float, Int } from "@nestjs/graphql";

export const PROPERTY_TABLE_NAME = 'property';

@ObjectType('PropertyType')
export class Property extends BaseModel {
  static get tableName() {
    return PROPERTY_TABLE_NAME;
  }

  @Field()
  id: string;

  @Field()
  source: string;

  @Field()
  url: string;

  @Field()
  externalId: string;

  @Field()
  name: string;

  @Field()
  photos: string;

  @Field()
  location: string;

  @Field()
  ownership: string; // freehold/ leasehold

  @Field()
  propertyType: string;

  @Field(() => Float, { nullable: true})
  landSize?: number;

  @Field(() => Float, { nullable: true})
  buildingSize?: number;

  @Field(() => Int, { nullable: true})
  bedroomsCount?: number;

  @Field(() => Int, { nullable: true})
  bathroomsCount?: number;

  @Field(() => Float, { nullable: true})
  priceIdr?: number;

  @Field(() => Float, { nullable: true})
  priceUsd?: number;

  @Field(() => Int, { nullable: true})
  leaseExpiryYear?: number;

  @Field(() => Int, { nullable: true})
  leaseYearsLeft?: number;

  @Field(() => Float, { nullable: true})
  pricePerBuildingSqm?: number;

  @Field(() => Float, { nullable: true})
  pricePerBuildingSqmPerYear?: number;

  @Field()
  pool?: string;

  @Field()
  notes: string;

  prices: Partial<PropertyPrice>[];

  static get relationMappings() {
    return {
      prices: {
        relation: Model.HasManyRelation,
        modelClass: PropertyPrice,
        join: {
          from: 'property.id',
          to: 'property_price.property_id',
        },
      },
    };
  }
}
