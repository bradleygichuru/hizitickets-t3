import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";

const mpesacallback = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req?.body);
  if (req?.body.Body.stkCallback.ResultCode == 0) {
    await prisma.transaction.update({
      where: {
        MerchantRequestID: req?.body.Body.stkCallback.MerchantRequestID,
      },
      data: { Valid: true },
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
};

export default mpesacallback;
