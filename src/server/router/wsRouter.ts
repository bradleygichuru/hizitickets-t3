import * as trpc from '@trpc/server';
import { EventEmitter } from 'events';
import z from 'zod';
import {Transaction} from '@prisma/client';
// create a global event emitter (could be replaced by redis, etc)
const ee = new EventEmitter()

export const wsRouter = trpc.router()
  .subscription('onCheck', {
    resolve({ ctx }) {
      // `resolve()` is triggered for each client when they start subscribing `onAdd`

      // return a `Subscription` with a callback which is triggered immediately
      return new trpc.Subscription<Boolean>((emit) => {
        ``
        const onAdd = async (data: string) => {
          // emit data to client
          const result = await ctx.transaction.findUnique({where:{MerchantRequestID:data.merchantRequestID}})
          emit.data(result.Validity)
        };

        // trigger `onAdd()` when `add` is triggered in our event emitter
        ee.on('add', onAdd);

        // unsubscribe function when client disconnects or stops subscribing
        return () => {
          ee.off('add', onAdd);
        };
      });
    },
  })
  .mutation('add', {
    input: z.object({
      merchantRequestID: z.string()
    }),
    async resolve({ ctx, input }) {
      const query = { ...input } /* [..] add to db */
      
      ee.emit('add', query);
      return query;
    },
  })
