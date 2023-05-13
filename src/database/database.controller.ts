import {
  Controller, Get, Inject, Res,
} from '@nestjs/common';
import { Connection } from '@willsoto/nestjs-objection';

@Controller('database')
export class DatabaseController {
  constructor(
    @Inject('core') public coreCon: Connection,
    @Inject('log') public logCon: Connection,
  ) {}

  @Get('check')
  async check(@Res() res: any) {
    try {
      await this.coreCon.raw('SELECT 1');
      await this.logCon.raw('SELECT 1');
      res.send('ok');
    } catch (e) {
      res.status(500);
    }
  }
}
