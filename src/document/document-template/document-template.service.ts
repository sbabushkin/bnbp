import { Injectable, Scope } from '@nestjs/common';
import { BaseService } from '../../common/base.service';
import { Context } from '../../common/context';
import { getOrThrow } from '../../util/guards';
import { removeHTML } from '../../helpers/common.helper';
import { CreateDocumentTemplateInput } from './dto/create-document-template.input';
import { DocumentTemplate } from './entities/document-template.entity';
import { DocumentTemplateNotFoundException } from '../../common/exceptions/document-template.exception';
import { UpdateDocumentTemplateInput } from './dto/update-document-template.input';
import { DocumentTemplateEvents } from './events';

@Injectable({ scope: Scope.REQUEST })
export class DocumentTemplateService extends BaseService {
  @Context()
  async create(createDocumentTemplateInput: CreateDocumentTemplateInput): Promise<DocumentTemplate> {
    const { date, trx, user } = this.ctx;

    const insertData = {
      authorId: user.id,
      documentTypeId: createDocumentTemplateInput.documentTypeId,
      description: removeHTML(createDocumentTemplateInput.description),
      fileId: createDocumentTemplateInput.fileId,
      name: removeHTML(createDocumentTemplateInput.name),
      created: date,
      updated: date,
    };

    const newDocumentTemplate = await DocumentTemplate.query(trx).insert(insertData).returning('*');
    this.emit(DocumentTemplateEvents.DOCUMENT_TEMPLATE_CREATED, newDocumentTemplate);

    return newDocumentTemplate;
  }

  @Context()
  async findOne(id: string, eagerString?: string): Promise<DocumentTemplate> {
    const { trx } = this.ctx;
    return getOrThrow(
      async () => DocumentTemplate
        .query(trx)
        .withGraphFetched(eagerString)
        .findById(id),
      new DocumentTemplateNotFoundException(id),
    );
  }

  @Context()
  async update(id: string, updateDocumentTemplateInput: UpdateDocumentTemplateInput) {
    const { trx, date } = this.ctx;

    await this.findOne(id);

    const updateData: Partial<DocumentTemplate> = {
      ...updateDocumentTemplateInput,
      updated: date,
    };

    if (updateData.description) {
      updateData.description = removeHTML(updateDocumentTemplateInput.description);
    }

    if (updateData.name) {
      updateData.name = removeHTML(updateDocumentTemplateInput.name);
    }

    const updatedDocumentTemplate = await DocumentTemplate.query(trx).patchAndFetchById(id, updateData);
    this.emit(DocumentTemplateEvents.DOCUMENT_TEMPLATE_UPDATED, updatedDocumentTemplate);
    return updatedDocumentTemplate;
  }

  @Context()
  async remove(id: string) {
    const { trx } = this.ctx;

    this.emit(DocumentTemplateEvents.DOCUMENT_TEMPLATE_DELETED, { id });

    return getOrThrow(
      async () => DocumentTemplate
        .query(trx)
        .where('id', id)
        .delete()
        .returning('*')
        .first(),
      new DocumentTemplateNotFoundException(id),
    );
  }
}
