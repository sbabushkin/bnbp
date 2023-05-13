import { InputType, Field } from '@nestjs/graphql';
import { DocumentTypeContextEntityTypeEnum } from '../document-type-context.enum';

@InputType()
export class CreateDocumentTypeInput {
  @Field({ description: 'The name of this type of document' })
  name: string;

  @Field({ description: 'Description of this type of document' })
  description: string;

  @Field(() => DocumentTypeContextEntityTypeEnum, { description: 'The name of the context in which certain entities are accessed' })
  context: DocumentTypeContextEntityTypeEnum;
}
