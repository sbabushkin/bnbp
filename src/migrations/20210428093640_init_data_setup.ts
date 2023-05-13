import * as Knex from 'knex';
import { userSeed } from './seeds_data/user.seed';
import { User } from '../user/entities/user.entity';

export async function up(knex: Knex): Promise<any> {
  const exists = await knex.schema.hasTable('user');

  const userSeedWithPwd = await Promise.all(
    userSeed.map(async (user: any) => {
      const pwd = await User.hashPassword(user.salt, user.login);
      return {
        ...user,
        pwd,
      };
    }),
  );

  if (exists) {
    await knex('user').insert(userSeedWithPwd);
  }
}

export async function down(knex: Knex): Promise<any> {
  const exists = await knex.schema.hasTable('user');

  if (exists) {
    await knex('user').truncate();
  }
}
