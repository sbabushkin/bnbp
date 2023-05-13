import { HttpModule, Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileResolver } from './file.resolver';
import { FileController } from './file.controller';
import { CacheModule } from '../cache/cache.module';
import { CacheService } from '../cache/cache.service';

@Module({
  imports: [CacheModule, HttpModule],
  providers: [
    FileResolver,
    FileService,
    FileController,
    CacheService,
  ],
  exports: [
    CacheService,
  ],
  controllers: [FileController],
})
export class FileModule {
}
