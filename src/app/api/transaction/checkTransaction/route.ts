import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
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

export async function POST(request: Request) {
  try {
    const { merchantRequestID } = bodySchema.parse(await request.json());

    const transaction = await prisma.transaction.findUnique({
      where: { MerchantRequestID: merchantRequestID },
    });

    if (!transaction) {
      return NextResponse.json({
        validity: false,
        cancelled: true,
        completed: false,
      });
    }

    if (transaction.completed || transaction.cancelled) {
      return NextResponse.json({
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

          return NextResponse.json({
            validity: true,
            transactionId: transaction.TransactionId,
            cancelled: false,
            completed: true,
            mpesaResDescription: `Paid ${paygateStatus.value_coin} ${paygateStatus.coin}`,
          });
        }
      }
    }

    return NextResponse.json({
      validity: transaction.Valid,
      transactionId: transaction.TransactionId,
      cancelled: transaction.cancelled,
      completed: transaction.completed,
      mpesaResDescription: transaction.mpesaTransactionDescription,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}