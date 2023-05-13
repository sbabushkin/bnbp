import * as Knex from 'knex';

const USER_TABLE_NAME = 'user';
const COLUMN_NAME = 'telegram_id';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(USER_TABLE_NAME, (table) => {
    table
      .string(COLUMN_NAME)
      .nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(USER_TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
}
