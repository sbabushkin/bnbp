import { Module } from '@nestjs/common';
import { PostgraphileService } from './postgraphile.service';

@Module({
  providers: [PostgraphileService],
  exports: [PostgraphileService],
})
export class PostgraphileModule {}
