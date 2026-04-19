import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import axios from "axios";

const PAYGATE_API_BASE = "https://api.paygate.to";

async function checkPayGateStatus(ipnToken: string) {
  try {
    const response = await axios({
      url: `${PAYGATE_API_BASE}/control/payment-status.php?ipn_token=${ipnToken}`,
      method: "get",
    });
    return response.data;
  } catch (error) {
    console.error("PayGate status check error:", error);
    return null;
  }
}

export const transactionRouter = router({
  checkTransaction: publicProcedure
    .input(z.object({ merchantRequestID: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const transaction = await ctx.prisma.transaction.findUnique({
          where: { MerchantRequestID: input.merchantRequestID },
        });

        if (!transaction) {
          return {
            validity: false,
            cancelled: true,
            completed: false,
          };
        }

        if (transaction?.completed || transaction?.cancelled) {
          return {
            validity: transaction?.Valid,
            transactionId: transaction?.TransactionId,
            cancelled: transaction?.cancelled,
            completed: transaction?.completed,
            mpesaResDescription: transaction?.mpesaTransactionDescription,
          };
        }

        if (transaction?.TransactionMethod === "PAYGATE" && transaction?.ipn_token) {
          const createdAt = new Date(transaction.transactionDate || transaction.createdAt);
          const now = new Date();
          const minutesSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60);

          if (minutesSinceCreated > 2) {
            const paygateStatus = await checkPayGateStatus(transaction.ipn_token);
            
            if (paygateStatus?.status === "paid") {
              await ctx.prisma.transaction.update({
                where: { TransactionId: transaction.TransactionId },
                data: {
                  completed: true,
                  mpesaReceiptNumber: paygateStatus.txid_out,
                  mpesaTransactionDescription: `Paid ${paygateStatus.value_coin} ${paygateStatus.coin}`,
                },
              });

              return {
                validity: true,
                transactionId: transaction.TransactionId,
                cancelled: false,
                completed: true,
                mpesaResDescription: `Paid ${paygateStatus.value_coin} ${paygateStatus.coin}`,
              };
            }
          }
        }

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
