import * as Knex from 'knex';

const PROPERTY_TABLE_NAME = 'property';
const PROPERTY_PRICE_TABLE_NAME = 'property_price';

export async function up(knex: Knex): Promise<any> {
  const exists = await knex.schema.hasTable(PROPERTY_TABLE_NAME);

  if (!exists) {
    await knex.schema.createTable(PROPERTY_TABLE_NAME, (table: any) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.string('url');
      table.string('source').notNullable();
      table.string('external_id').notNullable();
      table.text('photos');
      table.string('location');
      table.string('ownership');
      table.string('property_type');
      table.float('land_size');
      table.float('building_size');
      table.integer('bedrooms_size');
      table.integer('bedrooms_count');
      table.integer('bathrooms_count');
      table.specificType('price_idr', 'numeric(14,2)'); // TODO: numeric?
      table.specificType('price_usd', 'numeric(14,2)'); // TODO: numeric?
      table.integer('lease_expiry_year');
      table.integer('lease_years_left');
      table.string('price_per_building_sqm'); // TODO: calculation field?
      table.string('price_per_building_sqm_per_year'); // TODO: calculation field?
      table.string('pool');
      table.string('notes');
      table.dateTime('created').notNullable().defaultTo('now()');
      table.dateTime('updated').notNullable().defaultTo('now()');
    });


    await knex.schema.createTable(PROPERTY_PRICE_TABLE_NAME, (table: any) => {
      table.increments('id').unsigned().primary();
      table.uuid('property_id').notNullable();
      table.specificType('price_idr', 'numeric(14,2)'); // TODO: numeric?
      table.specificType('price_usd', 'numeric(14,2)');
      table.dateTime('created').notNullable().defaultTo('now()');

      table.foreign('property_id')
        .references('id')
        .inTable(PROPERTY_TABLE_NAME)
        .onDelete('CASCADE');
    });
  }
}

export async function down(knex: Knex): Promise<any> {
  const exists = await knex.schema.hasTable(PROPERTY_TABLE_NAME);

  if (exists) {
    await knex.schema.dropTable(PROPERTY_PRICE_TABLE_NAME);
    await knex.schema.dropTable(PROPERTY_TABLE_NAME);
  }
}
