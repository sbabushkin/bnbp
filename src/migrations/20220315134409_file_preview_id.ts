import * as Knex from 'knex';

const FILE_TABLE_NAME = 'file';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.table(FILE_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.uuid('preview_id');
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.table(FILE_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.dropColumn('preview_id');
  });
}
