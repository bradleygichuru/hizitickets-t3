import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";

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
      await prisma.transaction.update({
        where: {
          MerchantRequestID: req?.body.Body.stkCallback.MerchantRequestID,
        },
        data: {
          Valid: true,
          completed: true,
          mpesaReceiptNumber: receiptNumber,
          transactionDate: `${req?.body.Body.stkCallback.CallbackMetadata.Item[3].Value}`,
        },
      });
    }
    if (req?.body.Body.stkCallback.ResultCode == 1032) {
      console.log("cancelled");
      await prisma.transaction.update({
        where: {
          MerchantRequestID: req?.body.Body.stkCallback.MerchantRequestID,
        },
        data: { cancelled: true },
      });
    } else {
      console.log("error");
    }
    res.status(200).send("received");
  } catch (error) {
    console.log(error);
  }
};

export default mpesaCallback;
