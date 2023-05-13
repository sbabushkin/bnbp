import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateDocumentTemplateInput } from './create-document-template.input';

@InputType()
export class UpdateDocumentTemplateInput extends PartialType(CreateDocumentTemplateInput) {
  @Field()
  id: string;
}
