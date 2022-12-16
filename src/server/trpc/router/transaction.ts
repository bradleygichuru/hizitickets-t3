import { z } from "zod";
import { router, publicProcedure } from "../trpc";
export const transactionRouter = router({
  checkTransaction: publicProcedure
    .input(z.object({ merchantRequestID: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const transaction = await ctx.prisma.transaction.findUnique({
        where: { MerchantRequestID: input.merchantRequestID },
      });
      
      return {
        validity: transaction?.Valid,
        transactionId: transaction?.TransactionId,
        status: transaction?.cancelled,
      };
    }),
});
