import {
  Controller, Get, Param, Query, Res,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileCannotGetPreviewException } from '../common/exceptions';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: any) {
    const file = await this.fileService.findOneOuter(id);
    const stream = this.fileService.download(id);
    res.attachment(file.name);
    stream.pipe(res);
  }

  @Get(':id/preview')
  async preview(@Param('id') id: string, @Res() res: any) {
    try {
      const stream = await this.fileService.preview(id);
      stream.pipe(res);
    } catch (e) {
      throw new FileCannotGetPreviewException(id);
    }
  }

  @Get(':id/resize')
  async resize(
  @Param('id') id: string,
    @Query('w') width: number,
    @Query('h') height: number,
    @Res() res: any,
  ) {
    const file = await this.fileService.findOneOuter(id);

    if (!this.fileService.isImage(file)) {
      res.status(400).send('Файл не является изображением');
    }

    const buf = await this.fileService.getResize(id, width, height);
    res.setHeader('Content-Type', file.mimetype);
    res.send(buf);
  }
}
