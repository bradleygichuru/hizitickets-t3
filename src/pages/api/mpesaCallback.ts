import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";
import Decimal from "decimal.js";

const mpesaCallback = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log("stk result");
    console.log(req?.body);

    if (req?.body.Body.stkCallback.ResultCode == 0) {
      console.log("transaction valid");
      const receiptNumber =
        req?.body.Body.stkCallback.CallbackMetadata.Item[1].Value;
      console.log({ receiptNumber });
      console.log({
        transactionDate:
          req?.body.Body.stkCallback.CallbackMetadata.Item[3].Value,
      });
      const transaction = await prisma.transaction.update({
        where: {
          MerchantRequestID: req?.body.Body.stkCallback.MerchantRequestID,
        },
        data: {
          completed: true,
          mpesaReceiptNumber: receiptNumber,
          transactionDate: `${req?.body.Body.stkCallback.CallbackMetadata.Item[3].Value}`,
          mpesaTransactionDescription: req?.body.Body.stkCallback.ResultDesc,
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
          MerchantRequestID: req?.body.Body.stkCallback.MerchantRequestID,
        },
        data: {
          cancelled: true,
          mpesaTransactionDescription: req?.body.Body.stkCallback.ResultDesc,
        },
      });
    }
    res.status(200).send("received");
  } catch (error) {
    console.log(error);
  }
};

export default mpesaCallback;
