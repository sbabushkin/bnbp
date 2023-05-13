import { Injectable, Scope } from '@nestjs/common';
import { BaseService } from '../../common/base.service';
import { Context } from '../../common/context';
import { getOrThrow } from '../../util/guards';
import { removeHTML } from '../../helpers/common.helper';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { DocumentType } from './entities/document-type.entity';
import { DocumentTypeEvents } from './events';
import { DocumentTypeNotFoundException } from '../../common/exceptions/document-type.exception';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';

@Injectable({ scope: Scope.REQUEST })
export class DocumentTypeService extends BaseService {
  @Context()
  async create(createDocumentTypeInput: CreateDocumentTypeInput): Promise<DocumentType> {
    const { date, trx } = this.ctx;

    const insertData = {
      ...createDocumentTypeInput,
      description: removeHTML(createDocumentTypeInput.description),
      name: removeHTML(createDocumentTypeInput.name),
      created: date,
      updated: date,
    };

    const newDocumentType = await DocumentType.query(trx).insert(insertData).returning('*');
    this.emit(DocumentTypeEvents.DOCUMENT_TYPE_CREATED, newDocumentType);

    return newDocumentType;
  }

  @Context()
  async findOne(id: string, eagerString?: string): Promise<DocumentType> {
    const { trx } = this.ctx;
    const eager = eagerString;
    return getOrThrow(
      async () => DocumentType
        .query(trx)
        .withGraphFetched(eager)
        .findById(id),
      new DocumentTypeNotFoundException(id),
    );
  }

  @Context()
  async update(id: string, updateDocumentTypeInput: UpdateDocumentTypeInput) {
    const { trx, date } = this.ctx;

    await this.findOne(id);

    const updateData = {
      ...updateDocumentTypeInput,
      description: removeHTML(updateDocumentTypeInput.description),
      updated: date,
    };

    const updatedDocumentType = await DocumentType.query(trx).patchAndFetchById(id, updateData);
    this.emit(DocumentTypeEvents.DOCUMENT_TYPE_UPDATED, updatedDocumentType);
    return updatedDocumentType;
  }

  @Context()
  async remove(id: string) {
    const { trx } = this.ctx;

    this.emit(DocumentTypeEvents.DOCUMENT_TYPE_DELETED, { id });

    return getOrThrow(
      async () => DocumentType
        .query(trx)
        .where('id', id)
        .delete()
        .returning('*')
        .first(),
      new DocumentTypeNotFoundException(id),
    );
  }
}
