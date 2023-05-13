import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { GraphQLUpload } from '../common/uploadScalar';

@Resolver(() => File)
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FileResolver {
  constructor(private readonly fileService: FileService) {}

  @Mutation(() => File)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload }) attachment: FileUpload,
  ): Promise<File> {
    return this.fileService.upload(attachment);
  }
}
