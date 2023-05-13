import * as Knex from 'knex';
const COMMENT_TABLE_NAME = 'comment';
const USER_TABLE_NAME = 'user';
const FILE_TABLE_NAME = 'file';
const COMMENT_ATTACHMENT_TABLE_NAME = 'comment_attachment';

export async function up(knex: Knex): Promise<any> {
  // создание таблицы комментариев
  await knex.schema.createTable(COMMENT_TABLE_NAME, (table: Knex.TableBuilder) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('parent_id');
    table.uuid('author_id').notNullable();
    table.string('entity_type').notNullable();
    table.uuid('entity_id').notNullable();
    table.string('body').notNullable();
    table.dateTime('created').notNullable();
    table.dateTime('updated').notNullable();

    table.foreign('parent_id')
      .references('id')
      .inTable(COMMENT_TABLE_NAME)
      .onDelete('CASCADE');

    table.foreign('author_id')
      .references('id')
      .inTable(USER_TABLE_NAME)
      .onDelete('CASCADE');
  });

  // создание таблицы вложений комментариев
  await knex.schema.createTable(COMMENT_ATTACHMENT_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.increments('id').unsigned().primary();
    table.uuid('comment_id');
    table.uuid('file_id');

    table.foreign('comment_id')
      .references('id')
      .inTable(COMMENT_TABLE_NAME)
      .onDelete('CASCADE');

    table.foreign('file_id')
      .references('id')
      .inTable(FILE_TABLE_NAME)
      .onDelete('CASCADE');
  });

  await knex.raw(`
   CREATE FUNCTION public.${COMMENT_TABLE_NAME}_attachments(com public.${COMMENT_TABLE_NAME})
    RETURNS SETOF public.${FILE_TABLE_NAME} AS $$
    SELECT f.*
    FROM public.${FILE_TABLE_NAME} f
    WHERE f.id IN (
      SELECT file_id
      FROM public.${COMMENT_ATTACHMENT_TABLE_NAME}
      WHERE comment_id = com.id
    );
  $$ language sql stable;
  `);

  await knex.raw(`
   CREATE FUNCTION file_url(file file) RETURNS text AS $$
      SELECT 'http://${process.env.MAIN_DOMAIN}/file/download/' || file.id
    $$ LANGUAGE sql STABLE;
  `);
}

export async function down(knex: Knex): Promise<any> {
  await knex.raw(`DROP FUNCTION public.${COMMENT_TABLE_NAME}_attachments`);

  // удаление таблицы вложений комментариев
  if (await knex.schema.hasTable(COMMENT_ATTACHMENT_TABLE_NAME)) {
    await knex.schema.dropTable(COMMENT_ATTACHMENT_TABLE_NAME);
  }

  // удаление таблицы комментариев
  if (await knex.schema.hasTable(COMMENT_TABLE_NAME)) {
    await knex.schema.dropTable(COMMENT_TABLE_NAME);
  }
}
