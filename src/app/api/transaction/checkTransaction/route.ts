import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { z } from "zod";
import axios from "axios";
import { generateTicketsForTransaction } from "@/server/ticketGenerator";
import Decimal from "decimal.js";

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
      const secondsSinceCreated = (now.getTime() - createdAt.getTime()) / 1000;

      if (secondsSinceCreated > 30) {
        const paygateStatus = await checkPayGateStatus(transaction.ipn_token);

        if (paygateStatus?.status === "paid") {
          await prisma.transaction.update({
            where: { TransactionId: transaction.TransactionId },
            data: {
              completed: true,
              Valid: true,
              mpesaReceiptNumber: paygateStatus.txid_out,
              mpesaTransactionDescription: `Paid ${paygateStatus.value_coin} ${paygateStatus.coin}`,
            },
          });

          await generateTicketsForTransaction(transaction.TransactionId);

          const transactions = await prisma.transaction.findMany({
            where: { EventName: transaction.EventName, completed: true },
          });
          const totalRev = transactions.reduce(
            (acc, t) => acc.add(t.TotalAmount),
            new Decimal(0)
          );
          await prisma.event.update({
            where: { EventName: transaction.EventName },
            data: { TicketRevenue: totalRev },
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