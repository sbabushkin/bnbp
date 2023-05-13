import * as Knex from 'knex';

const USER_TABLE_NAME = 'user';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(USER_TABLE_NAME, (table) => {
    table
      .string('phone')
      .nullable()
      .alter();
  });

  // Удаляет лишние символы из номера. Если длина меньше 11, сетим null.
  await knex.raw(`
    UPDATE public.user
    SET phone = regexp_replace(phone, '\\D', '', 'gi');

    UPDATE public.user
    SET phone = null
    WHERE length(phone) < 11;`);

  await knex.schema.alterTable(USER_TABLE_NAME, (table) => {
    table
      .string('phone')
      .unique()
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(USER_TABLE_NAME, (table) => {
    table.dropUnique(['phone']);
    table.string('phone').notNullable().alter();
  });
}
