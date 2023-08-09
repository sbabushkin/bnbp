import {
  Controller, Res, Post, Param, UseGuards, Req
} from '@nestjs/common';
import { ParserService } from "./parser.service";


@Controller('')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}


  @Post('parse')
  async parseAll() {
    await this.parserService.parseAll();
  }


  @Post('parse/:source')
  async parse(@Param('source') source: string, @Res() res: any, @Req() req: any) {
    const data = await this.parserService.parseInner(source);
    res.send(data);
  }
}
