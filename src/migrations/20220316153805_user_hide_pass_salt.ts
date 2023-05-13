import * as Knex from 'knex';

const USER_TABLE_NAME = 'user';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.alterTable(USER_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.string('pwd').comment('@omit').alter();
    table.string('salt').comment('@omit').alter();
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.alterTable(USER_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.string('pwd').comment('').alter();
    table.string('salt').comment('').alter();
  });
}
