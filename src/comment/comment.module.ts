import { HttpModule, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';
import { FileModule } from '../file/file.module';
import { FileService } from '../file/file.service';

@Module({
  imports: [FileModule, HttpModule],
  providers: [CommentResolver, CommentService, FileService],
  exports: [CommentService],
})
export class CommentModule {}
