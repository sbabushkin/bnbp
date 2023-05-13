import * as Knex from 'knex';
import { Permission } from '../permission/entities/permission.entity';

const PERMISSION_TABLE_NAME = Permission.tableName;
const PARENT_ID_COLUMN_NAME = 'parent_id';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(PERMISSION_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.integer(PARENT_ID_COLUMN_NAME);
    table
      .foreign(PARENT_ID_COLUMN_NAME)
      .references('id')
      .inTable(PERMISSION_TABLE_NAME);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(PERMISSION_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.dropColumn(PARENT_ID_COLUMN_NAME);
  });
}
