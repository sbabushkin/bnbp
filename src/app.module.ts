import {
  UnauthorizedException, MiddlewareConsumer, Module, NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import { GraphQLSchema } from 'graphql';
import { stitchSchemas } from 'graphql-tools';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { config } from './config/base.config';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { EmailModule } from './email/email.module';
import { CacheModule } from './cache/cache.module';
import { FileModule } from './file/file.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgraphileService } from './postgraphile/postgraphile.service';
import { PostgraphileModule } from './postgraphile/postgraphile.module';
import { CommentModule } from './comment/comment.module';
import { EventModule } from './event/event.module';
import { DocumentTypeModule } from './document/document-type/document-type.module';
import { DocumentTemplateModule } from './document/document-template/document-template.module';
import { DocumentModule } from './document/document/document.module';
import { FsmModule } from './fsm/fsm.module';
import { ApplicationStatusModule } from './applicationStatus/applicationStatus.module';
import { PG_AUTH_ERROR_CODE } from './postgraphile/error-codes';
import { ParserModule } from "./parser/parser.module";
import { CurrencyModule } from "./currency/currency.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({

  imports: [
    UserModule,
    AuthModule,
    CurrencyModule,
    GraphQLModule.forRootAsync({
      imports: [PostgraphileModule],
      inject: [PostgraphileService],
      useFactory: async (postgraphileService: PostgraphileService) => {
        const pgSchema = await postgraphileService.schema();
        const typeMergingOptions: any = {
          validationSettings: {
            validationLevel: 'off',
          },
        };
        return {
          plugins: [pgSchema.plugin],
          formatError: (err: any) => {
            const currErr = err.originalError || err;
            const postgresAuthError = currErr.code === PG_AUTH_ERROR_CODE;

            if (postgresAuthError) {
              err.extensions.exception = new UnauthorizedException();
              err.message = 'Unauthorized';
            }

            return err;
          },
          autoSchemaFile: 'schema.gql',
          sortSchema: true,
          transformAutoSchemaFile: true,
          transformSchema: async (schema: GraphQLSchema) => stitchSchemas({
            subschemas: [
              { schema },
              { schema: pgSchema.schema },
            ],
            typeMergingOptions,
          }),
          installSubscriptionHandlers: true,
          context: ({ req, connection }) => (connection ? { req: { headers: connection.context } } : { req }),
          subscriptions: {
            onConnect: (connectionParams) => connectionParams,
          },
          uploads: false, // 👉 https://www.apollographql.com/docs/apollo-server/data/file-uploads/#uploads-in-node-14-and-later
        };
      },
    }),
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    RoleModule,
    PermissionModule,
    PubSubModule,
    EmailModule,
    CacheModule,
    FileModule,
    CommentModule,
    EventModule,
    DocumentTypeModule,
    DocumentTemplateModule,
    DocumentModule,
    FsmModule,
    ApplicationStatusModule,
    ParserModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(graphqlUploadExpress()).forRoutes('graphql');
  }
}
