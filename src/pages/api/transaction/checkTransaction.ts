import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";
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

const bodySchema = z.object({
  merchantRequestID: z.string(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "method not allowed" });
  }

  try {
    const { merchantRequestID } = bodySchema.parse(req.body);

    const transaction = await prisma.transaction.findUnique({
      where: { MerchantRequestID: merchantRequestID },
    });

    if (!transaction) {
      return res.status(200).json({
        validity: false,
        cancelled: true,
        completed: false,
      });
    }

    if (transaction.completed || transaction.cancelled) {
      return res.status(200).json({
        validity: transaction.Valid,
        transactionId: transaction.TransactionId,
        cancelled: transaction.cancelled,
        completed: transaction.completed,
        mpesaResDescription: transaction.mpesaTransactionDescription,
      });
    }

    if (transaction.TransactionMethod === "PAYGATE" && transaction.ipn_token) {
      const createdAt = new Date(transaction.transactionDate || Date.now());
      const now = new Date();
      const minutesSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60);

      if (minutesSinceCreated > 2) {
        const paygateStatus = await checkPayGateStatus(transaction.ipn_token);

        if (paygateStatus?.status === "paid") {
          await prisma.transaction.update({
            where: { TransactionId: transaction.TransactionId },
            data: {
              completed: true,
              mpesaReceiptNumber: paygateStatus.txid_out,
              mpesaTransactionDescription: `Paid ${paygateStatus.value_coin} ${paygateStatus.coin}`,
            },
          });

          return res.status(200).json({
            validity: true,
            transactionId: transaction.TransactionId,
            cancelled: false,
            completed: true,
            mpesaResDescription: `Paid ${paygateStatus.value_coin} ${paygateStatus.coin}`,
          });
        }
      }
    }

    return res.status(200).json({
      validity: transaction.Valid,
      transactionId: transaction.TransactionId,
      cancelled: transaction.cancelled,
      completed: transaction.completed,
      mpesaResDescription: transaction.mpesaTransactionDescription,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;