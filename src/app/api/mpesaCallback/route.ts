import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import Decimal from "decimal.js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("STK result", body);

    if (body?.Body?.stkCallback?.ResultCode == 0) {
      console.log("transaction valid");
      const receiptNumber = body?.Body?.stkCallback?.CallbackMetadata?.Item[1]?.Value;
      console.log({ receiptNumber });
      console.log({
        transactionDate: body?.Body?.stkCallback?.CallbackMetadata?.Item[3]?.Value,
      });
      
      const transaction = await prisma.transaction.update({
        where: {
          MerchantRequestID: body?.Body?.stkCallback?.MerchantRequestID,
        },
        data: {
          completed: true,
          mpesaReceiptNumber: receiptNumber,
          transactionDate: `${body?.Body?.stkCallback?.CallbackMetadata?.Item[3]?.Value}`,
          mpesaTransactionDescription: body?.Body?.stkCallback?.ResultDesc,
        },
      });
      
      const transactions = await prisma.transaction.findMany({
        where: { EventName: transaction?.EventName, completed: true },
      });
      const rev = new Decimal(0);
      const totalRev = transactions.reduce(
        (accumulator: Decimal, currentValue) =>
          accumulator.add(currentValue.TotalAmount),
        rev
      );
      await prisma.event.update({
        where: { EventName: transaction.EventName },
        data: { TicketRevenue: totalRev },
      });
    } else {
      await prisma.transaction.update({
        where: {
          MerchantRequestID: body?.Body?.stkCallback?.MerchantRequestID,
        },
        data: {
          cancelled: true,
          mpesaTransactionDescription: body?.Body?.stkCallback?.ResultDesc,
        },
      });
    }
    
    return new NextResponse("received", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("error", { status: 500 });
  }
}