import { Module } from '@nestjs/common';
import { DocumentTemplateResolver } from './document-template.resolver';
import { DocumentTemplateService } from './document-template.service';

@Module({
  providers: [DocumentTemplateResolver, DocumentTemplateService],
  exports: [DocumentTemplateService],
})
export class DocumentTemplateModule {}
