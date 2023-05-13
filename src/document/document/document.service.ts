import * as Excel from 'exceljs';
import { Injectable, Scope } from '@nestjs/common';
import { BaseService } from '../../common/base.service';
import { Context } from '../../common/context';
import { getOrThrow } from '../../util/guards';
import { removeHTML } from '../../helpers/common.helper';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { DocumentEvents } from './events';
import { Document } from './entities/document.entity';
import { DocumentNotFoundException } from '../../common/exceptions/document.exception';
import { DocumentTemplateService } from '../document-template/document-template.service';
import { File } from '../../file/entities/file.entity';
import { FileService } from '../../file/file.service';
import { CreateDocumentAndReportInput } from './dto/create-document-and-report.input';

@Injectable({ scope: Scope.REQUEST })
export class DocumentService extends BaseService {
  constructor(private readonly documentTemplateService: DocumentTemplateService, private readonly fileService: FileService) {
    super();
  }

  @Context()
  async create(createDocumentInput: CreateDocumentInput): Promise<Document> {
    const { date, trx, user } = this.ctx;

    const insertData = {
      authorId: user.id,
      documentTemplateId: createDocumentInput.documentTemplateId,
      description: removeHTML(createDocumentInput.description),
      name: removeHTML(createDocumentInput.name),
      fileId: createDocumentInput.fileId,
      projectId: createDocumentInput.projectId,
      created: date,
      updated: date,
    };

    const newDocument = await Document.query(trx).insert(insertData).returning('*');
    this.emit(DocumentEvents.DOCUMENT_CREATED, newDocument);

    return newDocument;
  }

  @Context()
  async findOne(id: string, eagerString?: string): Promise<Document> {
    const { trx } = this.ctx;
    const eager = eagerString;
    return getOrThrow(
      async () => Document
        .query(trx)
        .withGraphFetched(eager)
        .findById(id),
      new DocumentNotFoundException(id),
    );
  }

  @Context()
  async update(id: string, updateDocumentInput: UpdateDocumentInput) {
    const { trx, date } = this.ctx;

    await this.findOne(id);

    const updateData = {
      ...updateDocumentInput,
      description: removeHTML(updateDocumentInput.description),
      updated: date,
    };

    const updatedDocument = await Document.query(trx).patchAndFetchById(id, updateData);
    this.emit(DocumentEvents.DOCUMENT_UPDATED, updatedDocument);
    return updatedDocument;
  }

  @Context()
  async remove(id: string) {
    const { trx } = this.ctx;

    this.emit(DocumentEvents.DOCUMENT_DELETED, { id });

    return getOrThrow(
      async () => Document
        .query(trx)
        .where('id', id)
        .delete()
        .returning('*')
        .first(),
      new DocumentNotFoundException(id),
    );
  }

  // В данный момент берётся файл шаблона и сохраняется в новый файл
  async generateManagerialExecutionFile(documentTemplateId: string): Promise<File> {
    const template = await this.documentTemplateService.findOne(documentTemplateId, 'file');
    const templateFileData = await this.fileService.findOne(template.fileId);
    const templateFile = await this.fileService.download(template.fileId);

    const workbook = new Excel.Workbook();
    await workbook.xlsx.read(templateFile);

    const buffer = await workbook.xlsx.writeBuffer();

    const fileData = {
      filename: `${Date.now()}_${templateFileData.name}`,
      mimetype: templateFileData.mimetype,
      data: buffer,
      createReadStream() {
        return this.data;
      },
    };

    return this.fileService.upload(fileData);
  }

  @Context()
  async createDocumentManagerialExecutionFile(createDocumentAndReportInput: CreateDocumentAndReportInput): Promise<Document> {
    // TODO: will support some reports
    const newDocumentFile = await this.generateManagerialExecutionFile(createDocumentAndReportInput.documentTemplateId);

    return this.create({
      ...createDocumentAndReportInput,
      fileId: newDocumentFile.id,
    });
  }
}
