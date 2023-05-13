import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth-jwt.guard';
import { CreateDocumentTemplateInput } from './dto/create-document-template.input';
import { DocumentTemplateService } from './document-template.service';
import { UpdateDocumentTemplateInput } from './dto/update-document-template.input';
import { DocumentTemplate } from './entities/document-template.entity';

@Resolver(() => DocumentTemplate)
@UseGuards(JwtAuthGuard)
export class DocumentTemplateResolver {
  constructor(private readonly documentTemplateService: DocumentTemplateService) {}

  @Mutation(() => DocumentTemplate)
  createDocumentTemplate(@Args('input') createDocumentTemplateInput: CreateDocumentTemplateInput) {
    return this.documentTemplateService.create(createDocumentTemplateInput);
  }

  @Mutation(() => DocumentTemplate)
  updateDocumentTemplate(@Args('input') updateDocumentTemplateInput: UpdateDocumentTemplateInput) {
    return this.documentTemplateService.update(updateDocumentTemplateInput.id, updateDocumentTemplateInput);
  }

  @Mutation(() => DocumentTemplate)
  removeDocumentTemplate(@Args('id') id: string) {
    return this.documentTemplateService.remove(id);
  }
}
