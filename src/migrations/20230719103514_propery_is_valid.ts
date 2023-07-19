import * as Knex from 'knex';

const PROPERTY_TABLE_NAME = 'property';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.alterTable(PROPERTY_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.boolean('is_valid').notNullable().defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.alterTable(PROPERTY_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.dropColumn('is_valid');
  });
}
