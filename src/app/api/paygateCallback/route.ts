import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { generateTicketsForTransaction } from "@/server/ticketGenerator";
import Decimal from "decimal.js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get("number");
    const value_coin = searchParams.get("value_coin");
    const coin = searchParams.get("coin");
    const txid_in = searchParams.get("txid_in");
    const txid_out = searchParams.get("txid_out");
    const address_in = searchParams.get("address_in");
    const value_forwarded_coin = searchParams.get("value_forwarded_coin");

    console.log("PayGate callback received", Object.fromEntries(searchParams));

    if (number) {
      const transaction = await prisma.transaction.findUnique({
        where: { MerchantRequestID: number as string },
      });

      if (transaction) {
        await prisma.transaction.update({
          where: { TransactionId: transaction.TransactionId },
          data: {
            completed: true,
            Valid: true,
            paygateTxIdIn: txid_in as string,
            paygateTxIdOut: txid_out as string,
            paygateAddressIn: address_in as string,
            paygateValueForwarded: value_forwarded_coin ? parseFloat(value_forwarded_coin as string) : null,
            transactionDate: new Date().toISOString(),
            mpesaTransactionDescription: `Paid ${value_coin} ${coin}`,
          },
        });
        
        console.log(`Transaction ${number} (ID: ${transaction.TransactionId}) marked as completed`);

        await generateTicketsForTransaction(transaction.TransactionId);
        console.log(`Transaction ${number} tickets generated`);

        const transactions = await prisma.transaction.findMany({
          where: { EventName: transaction.EventName, completed: true },
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

        console.log(`Transaction ${number} fully processed`);
      }
    }

    return new NextResponse("received", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("error", { status: 500 });
  }
}