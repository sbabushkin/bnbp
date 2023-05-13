import { Field, InputType } from '@nestjs/graphql';
import { CreateDocumentTypeInput } from './create-document-type.input';

@InputType()
export class UpdateDocumentTypeInput extends CreateDocumentTypeInput {
  @Field()
  id: string;
}
