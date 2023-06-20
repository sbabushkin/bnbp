import * as Knex from 'knex';

const CURRENCY_TABLE_NAME = 'currency_rate';

export async function up(knex: Knex): Promise<any> {
  const currencyTableExists = await knex.schema.hasTable(CURRENCY_TABLE_NAME);

  if (!currencyTableExists) {
    await knex.schema.createTable(CURRENCY_TABLE_NAME, (table: any) => {
      table.increments('id').unsigned().primary();
      table.string('from', 250).notNullable();
      table.string('to', 250).notNullable();
      table.double('amount');
      table.dateTime('created').notNullable().defaultTo('now()');
    });
  }
}

export async function down(knex: Knex): Promise<any> {
  const currencyTableExists = await knex.schema.hasTable(CURRENCY_TABLE_NAME);

  if (currencyTableExists) {
    await knex.schema.dropTable(CURRENCY_TABLE_NAME);
  }

}
