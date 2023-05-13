import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class GetEventsInput {
  @Field()
  entityId: string;

  @Field(() => Int, { description: 'Events records limit', nullable: true })
  limit?: number;

  @Field(() => Int, { description: 'Events records offset', nullable: true })
  offset?: number;

  @Field(() => [String], { description: 'Events types to query', nullable: true })
  eventsTypes?: string[];
}
