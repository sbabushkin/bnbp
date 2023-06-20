import * as Knex from 'knex';

const PROPERTY_TABLE_NAME = 'property';
const COLUMN_NAME = 'lease_years_left';

export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable(PROPERTY_TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });

  await knex.raw(`
    CREATE FUNCTION property_lease_years_left(property property) RETURNS double precision AS $$
      SELECT (property.lease_expiry_year - date_part('year', now()));
    $$ LANGUAGE sql STABLE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP FUNCTION property_lease_years_left;
  `);

  await knex.schema.alterTable(PROPERTY_TABLE_NAME, (table) => {
    table.integer(COLUMN_NAME)
  });
}
