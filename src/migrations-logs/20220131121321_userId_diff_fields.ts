import * as Knex from 'knex';

const EVENT_TABLE_NAME = 'event';
const USER_ID_INDEX_NAME = 'user_idx';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table(EVENT_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.uuid('user_id');
    table.jsonb('diff');
  });

  await knex.raw(`
    UPDATE public.event
    set user_id = ("user"->>'id')::uuid;
    UPDATE public.event
    set diff = payload || jsonb_build_object('type', type)
    WHERE type ilike '%update%';
    UPDATE public.event
    set payload = payload || jsonb_build_object('type', type);

    CREATE INDEX ${USER_ID_INDEX_NAME} ON public.event (user_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table(EVENT_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.dropColumn('user_id');
    table.dropColumn('diff');
  });
}
