import * as Knex from 'knex';

import { roleSeed } from './seeds_data/role.seed';
import { userSeed } from './seeds_data/user.seed';
import { permissionSeed } from './seeds_data/permission.seed';

const USER_TABLE_NAME = 'user';
const ROLE_TABLE_NAME = 'role';
const USER_ROLE_TABLE_NAME = 'user_role';
const PERMISSION_TABLE_NAME = 'permission';
const ROLE_PERMISSION_TABLE_NAME = 'role_permission';

export async function up(knex: Knex): Promise<any> {
  const roleTableExists = await knex.schema.hasTable(ROLE_TABLE_NAME);

  if (!roleTableExists) {
    await knex.schema.createTable(ROLE_TABLE_NAME, (table: any) => {
      table.increments('id').unsigned().primary();
      table.string('name', 250).notNullable();
      table.string('code', 50).notNullable().unique();
    });
  }

  const userRoleTableExists = await knex.schema.hasTable(USER_ROLE_TABLE_NAME);

  if (!userRoleTableExists) {
    await knex.schema.createTable(USER_ROLE_TABLE_NAME, (table: any) => {
      table.increments('id').unsigned().primary();
      table.integer('role_id').notNullable();
      table.foreign('role_id')
        .references('id')
        .inTable(ROLE_TABLE_NAME)
        .onDelete('CASCADE');
      table.uuid('user_id').notNullable();
      table.foreign('user_id')
        .references('id')
        .inTable(USER_TABLE_NAME)
        .onDelete('CASCADE');
    });
  }

  const permissionTableExists = await knex.schema.hasTable(PERMISSION_TABLE_NAME);

  if (!permissionTableExists) {
    await knex.schema.createTable(PERMISSION_TABLE_NAME, (table: any) => {
      table.increments('id').unsigned().primary();
      table.string('name', 250).notNullable();
      table.string('group', 50).notNullable();
      table.string('code', 50).notNullable().unique();
    });
  }

  const rolePermissionTableExists = await knex.schema.hasTable(ROLE_PERMISSION_TABLE_NAME);

  if (!rolePermissionTableExists) {
    await knex.schema.createTable(ROLE_PERMISSION_TABLE_NAME, (table: any) => {
      table.increments('id').unsigned().primary();
      table.integer('permission_id').notNullable();
      table.foreign('permission_id')
        .references('id')
        .inTable(PERMISSION_TABLE_NAME)
        .onDelete('CASCADE');
      table.integer('role_id').notNullable();
      table.foreign('role_id')
        .references('id')
        .inTable(ROLE_TABLE_NAME)
        .onDelete('CASCADE');
    });
  }

  await knex(PERMISSION_TABLE_NAME).insert(permissionSeed);
  await knex(ROLE_TABLE_NAME).insert(roleSeed);

  await knex(ROLE_PERMISSION_TABLE_NAME).insert([ // TODO: batch insert or delete it
    {
      permission_id: 2,
      role_id: 2, // admin
    },
  ]);

  await knex(USER_ROLE_TABLE_NAME).insert(userSeed.map((u) => ({
    user_id: u.id,
    role_id: 2, // admin
  })));
}

export async function down(knex: Knex): Promise<any> {
  const rolePermissionTableExists = await knex.schema.hasTable(ROLE_PERMISSION_TABLE_NAME);

  if (rolePermissionTableExists) {
    await knex.schema.dropTable(ROLE_PERMISSION_TABLE_NAME);
  }

  const permissionTableExists = await knex.schema.hasTable(PERMISSION_TABLE_NAME);

  if (permissionTableExists) {
    await knex.schema.dropTable(PERMISSION_TABLE_NAME);
  }

  const userRoleTableExists = await knex.schema.hasTable(USER_ROLE_TABLE_NAME);

  if (userRoleTableExists) {
    await knex.schema.dropTable(USER_ROLE_TABLE_NAME);
  }

  const roleTableExists = await knex.schema.hasTable(ROLE_TABLE_NAME);

  if (roleTableExists) {
    await knex.schema.dropTable(ROLE_TABLE_NAME);
  }
}
