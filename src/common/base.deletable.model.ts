import {
  Constructor,
  JSONSchema,
  Model,
  Modifiers,
  QueryBuilder,
  TransactionOrKnex,
} from 'objection';
import BaseModel from './base.model';

export interface SoftDeletable {
  isSoftDeleted(): boolean;
}

export function isSoftDeletable(obj: any): obj is SoftDeletable {
  return (obj as SoftDeletable).isSoftDeleted !== undefined;
}

export class DeletableModelOptions {
  columnName: string;

  deletedValue: Date | boolean | number;

  notDeletedValue: boolean | null;
}

// code taken from here mostly https://github.com/alex-w0/objection-js-soft-delete
export class SoftDeleteQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<M, R> {
  // Unfortunately these three types need to be hand-written
  // for each custom query builder.
  AQB: SoftDeleteQueryBuilder<M, M[]>;

  SQB: SoftDeleteQueryBuilder<M, M>;

  NQB: SoftDeleteQueryBuilder<M, number>;

  private readonly options: DeletableModelOptions = {
    columnName: 'deleted_at',
    deletedValue: new Date(),
    notDeletedValue: null,
  };

  delete() {
    this.context({
      softDelete: true,
    });
    const patch = {};
    patch[this.options.columnName] = this.options.deletedValue;
    return this.patch(patch);
  }

  // provide a way to actually delete the row if necessary
  hardDelete() {
    return super.delete();
  }

  // provide a way to undo the delete
  undelete() {
    this.context({
      undelete: true,
    });
    const patch = {};
    patch[this.options.columnName] = this.options.notDeletedValue;
    return this.patch(patch);
  }

  // provide a way to filter to ONLY deleted records without having to remember the column name
  whereDeleted() {
    // qualify the column name
    return this.whereNot(
      `${this.modelClass().tableName}.${this.options.columnName}`,
      this.options.notDeletedValue,
    );
  }

  // provide a way to filter out deleted records without having to remember the column name
  whereNotDeleted() {
    // qualify the column name
    return this.where(
      `${this.modelClass().tableName}.${this.options.columnName}`,
      this.options.notDeletedValue,
    );
  }
}

export class BaseDeletableModel extends BaseModel implements SoftDeletable {
  static QueryBuilder = SoftDeleteQueryBuilder;

  static query<M extends BaseModel>(
    this: Constructor<M>,
    trxOrKnex?: TransactionOrKnex,
    skipDefaultModifier: boolean = false,
  ): SoftDeleteQueryBuilder<M> {
    const query = super.query(trxOrKnex) as SoftDeleteQueryBuilder<M>;
    return skipDefaultModifier ? query : query.modify('notDeleted');
  }

  static get jsonSchema(): JSONSchema {
    return {
      properties: { deletedAt: { type: ['string', null] } },
      additionalProperties: true,
    };
  }

  static get modifiers(): Modifiers<SoftDeleteQueryBuilder<BaseModel>> {
    return {
      ...super.modifiers,
      notDeleted(builder) {
        builder.whereNotDeleted();
      },
      deleted(builder) {
        builder.whereDeleted();
      },
    };
  }

  static get isSoftDeletable(): boolean {
    return true;
  }

  deletedAt?: string;

  isSoftDeleted(): boolean {
    return !!this.deletedAt;
  }
}
