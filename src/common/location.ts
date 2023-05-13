import {
  Field, Float, InputType, ObjectType,
} from '@nestjs/graphql';

@ObjectType()
@InputType('LocationInput')
export default class Location {
  @Field(() => Float, { description: 'Longitude' })
  lon: number;

  @Field(() => Float, { description: 'Latitude' })
  lat: number;

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        lon: { type: 'number' },
        lat: { type: 'number' },
      },
    };
  }
}
