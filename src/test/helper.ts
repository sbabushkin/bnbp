import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';

export const executionTimeout = 20 * 1000;

export type TypedRemover<T> = () => Promise<T>;

export function updateString(v: string): string {
  return `updated ${v}`;
}

export function updateNumber(v: number): number {
  return v * 2;
}

export function updateBoolean(v: boolean): boolean {
  return !v;
}

export function updateStringDate(v: string): string {
  const date = new Date(v);
  if (!date) throw new Error(`invalid date ${v}`);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

export function nextDateCreator(): () => string {
  const now = new Date();
  return function (): string {
    now.setSeconds(now.getSeconds() + 1);
    return now.toISOString();
  };
}

export function prepareTestingModule(moduleCallback: (TestingModule) => void) {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();
    moduleCallback(module);
  });

  afterAll(async () => {
    await module.close();
  });
}
