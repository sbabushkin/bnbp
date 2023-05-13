import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDocumentTemplateInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  documentTypeId: string;

  @Field()
  fileId: string;
}
