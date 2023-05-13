import { IsNumber } from 'class-validator';

export class SmsCSuccessResponseEntity {
  @IsNumber()
  cnt: number;

  @IsNumber()
  id: number;
}
