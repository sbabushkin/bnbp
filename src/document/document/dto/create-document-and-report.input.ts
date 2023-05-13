import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDocumentAndReportInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  documentTemplateId: string;

  @Field()
  projectId: string;
}
