import * as Knex from 'knex';
import { Comment } from '../comment/entities/comment.entity';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Comment.tableName, (table) => {
    table.string('body').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`UPDATE ${Comment.tableName} SET body = '' WHERE body IS NULL`);

  await knex.schema.alterTable(Comment.tableName, (table) => {
    table.string('body').notNullable().alter();
  });
}
