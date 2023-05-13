import BaseModel from '../../common/base.model';
import { Model } from "objection";
import { Property } from  './property.entity';

export const PROPERTY_PRICE_TABLE_NAME = 'property_price';

export class PropertyPrice extends BaseModel {
  static get tableName() {
    return PROPERTY_PRICE_TABLE_NAME;
  }

  id: number;

  propertyId: string;

  priceIDR: number;

  priceUSD: number;

  created: string;

  static get relationMappings() {
    return {
      permissions: {
        relation: Model.BelongsToOneRelation,
        modelClass: Property,
        join: {
          from: 'property_price.property_id',
          to: 'property.id',
        },
      },
    };
  }
}
