import { z } from "zod";
import { router, publicProcedure } from "../trpc";
export const transactionRouter = router({
  checkTransaction: publicProcedure
    .input(z.object({ merchantRequestID: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const transaction = await ctx.prisma.transaction.findUnique({
          where: { MerchantRequestID: input.merchantRequestID },
        });

        return {
          validity: transaction?.Valid,
          transactionId: transaction?.TransactionId,
          cancelled: transaction?.cancelled,
          completed: transaction?.completed,
          mpesaResDescription: transaction?.mpesaTransactionDescription,
        };
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured " };
      }
    }),
  findTransaction: publicProcedure
    .input(z.object({ mpesaTransCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const transaction = await ctx.prisma.transaction.findFirst({
          where: { mpesaReceiptNumber: input?.mpesaTransCode },
        });
        if (transaction) {
          return { transaction, status: "success" };
        } else {
          return { status: "failed" };
        }
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured " };
      }
    }),
});
