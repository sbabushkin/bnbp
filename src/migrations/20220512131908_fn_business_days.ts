import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
   CREATE OR REPLACE FUNCTION count_business_days(from_date date, to_date date)
   RETURNS BIGINT AS $$
        SELECT COUNT(d::date) AS d
        FROM generate_series(from_date, to_date, '1 day'::interval) d
        WHERE EXTRACT('dow' from d) NOT IN (0, 6) 
   $$ language sql
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP FUNCTION count_business_days');
}
