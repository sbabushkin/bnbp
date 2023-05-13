import { Module } from '@nestjs/common';
import { DocumentTypeResolver } from './document-type.resolver';
import { DocumentTypeService } from './document-type.service';

@Module({
  providers: [DocumentTypeResolver, DocumentTypeService],
})
export class DocumentTypeModule {}
