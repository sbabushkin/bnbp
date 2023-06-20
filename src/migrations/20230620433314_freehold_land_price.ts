import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE FUNCTION property_freehold_land_price(property property) RETURNS double precision AS $$
      SELECT
      CASE WHEN property.ownership = 'freehold'
      THEN property.land_size
      ELSE null
      END
      FROM property;
    $$ LANGUAGE sql STABLE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP FUNCTION property_freehold_land_price;
  `);
}
