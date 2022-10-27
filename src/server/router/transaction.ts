import { z } from "zod";
import { createRouter } from "./context";

export const transactionRouter = createRouter().mutation("checkTransaction", {
  input: z.object({ merchantRequestID: z.string() }),
  async resolve({ ctx, input }) {
    const transaction = await ctx.prisma.transaction.findUnique({
      where: { MerchantRequestID: input.merchantRequestID },
    });
    return {
      validity: transaction?.Valid,
      transactionId: transaction?.TransactionId,
    };
  },
});
