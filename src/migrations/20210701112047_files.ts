import * as Knex from 'knex';

const FILE_TABLE_NAME = 'file';

export async function up(knex: Knex): Promise<any> {
  // создание таблицы проектов
  await knex.schema.createTable(FILE_TABLE_NAME, (table: Knex.TableBuilder) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name');
    table.string('mimetype');
    table.dateTime('created').notNullable();
    table.dateTime('updated').notNullable();
  });
}

export async function down(knex: Knex): Promise<any> {
  // удаление таблицы для связки проекта с секциями
  if (await knex.schema.hasTable(FILE_TABLE_NAME)) {
    await knex.schema.dropTable(FILE_TABLE_NAME);
  }
}
