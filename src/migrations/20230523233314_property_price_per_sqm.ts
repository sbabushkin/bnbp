import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE FUNCTION property_price_per_sqm(property property) RETURNS double precision AS $$
      SELECT ROUND((COALESCE(property.price_usd, 0)/COALESCE(NULLIF(property.building_size, 0), 1))::numeric, 2);
    $$ LANGUAGE sql STABLE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP FUNCTION property_price_per_sqm;
  `);
}
