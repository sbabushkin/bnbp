import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/auth-jwt.guard';
import { CreateDocumentInput } from './dto/create-document.input';
import { DocumentService } from './document.service';
import { UpdateDocumentInput } from './dto/update-document.input';
import { Document } from './entities/document.entity';

@Resolver(() => Document)
@UseGuards(JwtAuthGuard)
export class DocumentResolver {
  constructor(private readonly documentService: DocumentService) {}

  @Mutation(() => Document)
  createDocument(@Args('input') createDocumentInput: CreateDocumentInput) {
    return this.documentService.create(createDocumentInput);
  }

  // На будущее, для формирования отчётов
  /* @Mutation(() => Document)
  createDocumentManagerialExecutionFile(@Args('input') createDocumentAndReportInput: CreateDocumentAndReportInput) {
    return this.documentService.createDocumentManagerialExecutionFile(createDocumentAndReportInput);
  } */

  @Mutation(() => Document)
  updateDocument(@Args('input') updateDocumentInput: UpdateDocumentInput) {
    return this.documentService.update(updateDocumentInput.id, updateDocumentInput);
  }

  @Mutation(() => Document)
  removeDocument(@Args('id') id: string) {
    return this.documentService.remove(id);
  }
}
