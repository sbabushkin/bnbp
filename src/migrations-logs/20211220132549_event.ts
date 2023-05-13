import * as Knex from 'knex';

const EVENT_TABLE_NAME = 'event';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.createTable(EVENT_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.uuid('id').primary();
    table.string('entity_id', 50);
    table.string('aggregate_id', 50);
    table.string('type', 50);
    table.jsonb('user');
    table.jsonb('payload');
    table.dateTime('created').notNullable();

    table.index('entity_id');
    table.index('aggregate_id');
    table.index('type');
    table.index('created');
  });
}

export async function down(knex: Knex): Promise<any> {
  const exists = await knex.schema.hasTable(EVENT_TABLE_NAME);

  if (exists) {
    await knex.schema.dropTable(EVENT_TABLE_NAME);
  }
}
