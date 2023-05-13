import { Injectable, Scope } from '@nestjs/common';
import { omit } from 'lodash';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { BaseService } from '../common/base.service';
import { Context } from '../common/context';
import { Comment } from './entities/comment.entity';
import { entityTypeClassMap } from './comment.enum';
import { CommentNotFoundException, EntityNotFoundException } from '../common/exceptions';
import { getOrThrow } from '../util/guards';
import { removeHTML } from '../helpers/common.helper';
import { FileService } from '../file/file.service';
import { CommentEvents } from './events';

@Injectable({ scope: Scope.REQUEST })
export class CommentService extends BaseService {
  constructor(
    private readonly fileService: FileService,
  ) {
    super();
  }

  @Context()
  async createOuter(createCommentInput: CreateCommentInput): Promise<Comment> {
    return this.create(createCommentInput);
  }

  async create(createCommentInput: CreateCommentInput): Promise<Comment> {
    const { date, trx, user } = this.ctx;
    const entityClass = entityTypeClassMap.get(createCommentInput.entityType);
    const entity = await entityClass.query(trx).findById(createCommentInput.entityId);

    if (!entity) {
      throw new EntityNotFoundException(createCommentInput.entityType, createCommentInput.entityId);
    }

    const insertData = {
      ...omit(createCommentInput, ['attachmentIds']),
      authorId: user.id,
      body: removeHTML(createCommentInput.body),
      created: date,
      updated: date,
    };

    const newComment = await Comment.query(trx).insert(insertData).returning('*');

    if (createCommentInput.attachmentIds?.length) {
      await Promise.all(createCommentInput.attachmentIds.map((id) => this.fileService.findOne(id)));

      await newComment.$relatedQuery('attachments', trx).relate(createCommentInput.attachmentIds);
    }

    const result = await this.findOne(newComment.id, '[attachments, task]');
    this.emit(
      CommentEvents.COMMENT_CREATED,
      result,
      result.parentId || result.entityId,
      { id: result.id },
    );
    return result;
  }

  @Context()
  async findOne(id: string, eagerString?: string) {
    const { trx } = this.ctx;
    const eager = eagerString || 'attachments';
    return getOrThrow(
      async () => Comment
        .query(trx)
        .withGraphFetched(eager)
        .findById(id),
      new CommentNotFoundException(id),
    );
  }

  @Context()
  async update(id: string, updateCommentInput: UpdateCommentInput) {
    const { trx, date } = this.ctx;

    await this.findOne(id);

    const updateData = {
      ...updateCommentInput,
      body: removeHTML(updateCommentInput.body),
      updated: date,
    };

    return Comment.query(trx).patchAndFetchById(id, updateData);
  }

  @Context()
  async remove(id: string) {
    const { trx } = this.ctx;
    return getOrThrow(
      async () => Comment
        .query(trx)
        .where('id', id)
        .delete()
        .returning('*')
        .first(),
      new CommentNotFoundException(id),
    );
  }
}
