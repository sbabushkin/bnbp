import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  const exists = await knex.schema.hasTable('user');

  if (!exists) {
    await knex.schema.createTable('user', (table: any) => {
      table.uuid('id').primary();
      table.string('first_name', 250).notNullable();
      table.string('middle_name', 250);
      table.string('last_name', 250).notNullable();
      table.string('login', 250).notNullable().unique();
      table.string('email', 1000).notNullable().unique();
      table.string('phone', 250).notNullable();
      table.string('pic', 1000);
      table.string('status', 50).notNullable();
      table.dateTime('created').notNullable();
      table.dateTime('updated');
      table.dateTime('last_login');
      table.string('pwd');
      table.string('salt');
    });
  }
}

export async function down(knex: Knex): Promise<any> {
  const exists = await knex.schema.hasTable('user');

  if (exists) {
    await knex.schema.dropTable('user');
  }
}
