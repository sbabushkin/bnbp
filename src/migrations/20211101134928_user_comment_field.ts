import * as Knex from 'knex';

const USER_TABLE_NAME = 'user';
const USER_ROLES_TABLE_NAME = 'user_role';
const ROLES_TABLE_NAME = 'role';

export async function up(knex: Knex): Promise<any> {
  await knex.schema.table(USER_TABLE_NAME, (table: any) => {
    table.string('comment');
  });

  await knex.raw(
    `CREATE FUNCTION public.${USER_TABLE_NAME}_roles(u public.${USER_TABLE_NAME})
      RETURNS SETOF public.${ROLES_TABLE_NAME} AS $$
      SELECT r.*
      FROM public.${USER_ROLES_TABLE_NAME} rl
      JOIN public.${ROLES_TABLE_NAME} r
      ON rl.role_id = r.id
      WHERE rl.user_id = u.id
      $$ language sql stable;`,
  );
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.table(USER_TABLE_NAME, (table: Knex.TableBuilder) => {
    table.dropColumn('comment');
  });
  await knex.raw(`DROP FUNCTION public.${USER_TABLE_NAME}_roles`);
}
