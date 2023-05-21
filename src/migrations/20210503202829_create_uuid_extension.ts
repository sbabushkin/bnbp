import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  // await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
  // await knex.raw('DROP EXTENSION IF EXISTS postgis');
}
