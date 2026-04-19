import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";
import Decimal from "decimal.js";

const paygateCallback = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log("PayGate callback received");
    console.log(req?.query);

    const { number, value_coin, coin, txid_in, txid_out, address_in, value_forwarded_coin } = req?.query;

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
            mpesaReceiptNumber: txid_in as string,
            transactionDate: new Date().toISOString(),
            mpesaTransactionDescription: `Paid ${value_coin} ${coin}`,
          },
        });
        
        console.log(`Transaction ${number} (ID: ${transaction.TransactionId}) marked as completed`);

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

        console.log(`Transaction ${number} marked as completed`);
      }
    }

    res.status(200).send("received");
  } catch (error) {
    console.log(error);
    res.status(500).send("error");
  }
};

export default paygateCallback;