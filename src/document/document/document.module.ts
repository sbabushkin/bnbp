import { HttpModule, Module } from '@nestjs/common';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
import { DocumentTemplateModule } from '../document-template/document-template.module';
import { FileModule } from '../../file/file.module';
import { FileService } from '../../file/file.service';

@Module({
  imports: [DocumentTemplateModule, FileModule, HttpModule],
  providers: [DocumentResolver, DocumentService, FileService],
})
export class DocumentModule {}
