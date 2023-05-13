import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDocumentInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  documentTemplateId: string;

  @Field()
  fileId: string;

  @Field()
  projectId: string;
}
