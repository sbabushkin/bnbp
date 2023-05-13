import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth-jwt.guard';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { DocumentTypeService } from './document-type.service';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';
import { DocumentType } from './entities/document-type.entity';

@Resolver(() => DocumentType)
@UseGuards(JwtAuthGuard)
export class DocumentTypeResolver {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Mutation(() => DocumentType)
  createDocumentType(@Args('input') createDocumentTypeInput: CreateDocumentTypeInput) {
    return this.documentTypeService.create(createDocumentTypeInput);
  }

  @Mutation(() => DocumentType)
  updateDocumentType(@Args('input') updateDocumentTypeInput: UpdateDocumentTypeInput) {
    return this.documentTypeService.update(updateDocumentTypeInput.id, updateDocumentTypeInput);
  }

  @Mutation(() => DocumentType)
  removeDocumentType(@Args('id') id: string) {
    return this.documentTypeService.remove(id);
  }
}
