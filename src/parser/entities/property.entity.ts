import BaseModel from '../../common/base.model';
import { Model } from "objection";
import { Permission } from "../../permission/entities/permission.entity";
import { PropertyPrice } from "./property_price.entity";

export const PROPERTY_TABLE_NAME = 'property';

export class Property extends BaseModel {
  static get tableName() {
    return PROPERTY_TABLE_NAME;
  }

  id: string;

  source: string;

  url: string;

  externalId: string;

  name: string;

  photos: string;

  location: string;

  ownership: string; // freehold/ leasehold

  propertyType: string;

  landSize: number;

  buildingSize: number;

  bedroomsCount: number;

  bathroomsCount: number;

  priceIdr: number;

  priceUsd: number;

  leaseExpiryYear: number;

  leaseYearsLeft: number;

  pricePerBuildingSqm: number;

  pricePerBuildingSqmPerYear: number;

  pool: string;

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
