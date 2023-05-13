import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateDocumentInput } from './create-document.input';

@InputType()
export class UpdateDocumentInput extends PartialType(CreateDocumentInput) {
  @Field()
  id: string;
}
