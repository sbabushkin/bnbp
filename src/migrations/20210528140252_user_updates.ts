import * as Knex from 'knex';

const USER_TABLE_NAME = 'user';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.table(USER_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.string('gender').notNullable().defaultTo('male');
    table.boolean('password_set_by_user').notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.table(USER_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.dropColumn('gender');
    table.dropColumn('password_set_by_user');
  });
}
