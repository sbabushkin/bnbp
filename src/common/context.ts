import { transaction, Model } from 'objection';
import { BaseService, IServiceContext } from './base.service';

export interface RequestOptions {
  withTran?: boolean;
  trace?: boolean;
}

export function Context({ withTran }: RequestOptions = { withTran: true }) {
  return function (target: BaseService, propertyKey: string, descriptor: any) {
    let currDescriptor = descriptor;
    if (!currDescriptor) {
      currDescriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    }
    const originalMethod = currDescriptor.value;

    currDescriptor.value = async function (...args: any[]) {
      const currContext = this.getContext();

      const date = new Date().toISOString();
      const knex = Model.knex();

      const newServiceContext: any = currContext || {
        date,
        eventBuffer: [],
        spanTraceStack: [],
      };

      const callWithEmitContext = async (context: IServiceContext) => {
        this.setupContext(context);
        const result = await originalMethod.apply(this, args);
        return result;
      };

      if (withTran && !currContext) {
        return transaction(knex, async (trx) => {
          newServiceContext.trx = trx;
          const result = await callWithEmitContext(newServiceContext);

          if (!currContext) {
            await this.flush();
          }

          return result;
        });
      }

      return callWithEmitContext(newServiceContext);
    };

    return currDescriptor;
  };
}
