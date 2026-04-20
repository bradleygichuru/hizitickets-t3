import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";

const bodySchema = z.object({
  searchBy: z.enum(["receipt", "emailPhone"]),
  receiptNumber: z.string().optional(),
  email: z.string().email().optional(),
  mobileNumber: z.string().optional(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "method not allowed" });
  }

  try {
    const { searchBy, receiptNumber, email, mobileNumber } = bodySchema.parse(req.body);

    let transaction;

    if (searchBy === "receipt" && receiptNumber) {
      transaction = await prisma.transaction.findFirst({
        where: {
          OR: [
            { paygateTxIdIn: receiptNumber },
            { paygateTxIdOut: receiptNumber },
            { mpesaReceiptNumber: receiptNumber },
            { MerchantRequestID: receiptNumber },
          ],
        },
        include: {
          event: true,
          tickets: true,
        },
      });
    } else if (searchBy === "emailPhone" && email && mobileNumber) {
      transaction = await prisma.transaction.findFirst({
        where: {
          email: email,
          MobileNumber: mobileNumber,
          completed: true,
        },
        include: {
          event: true,
          tickets: true,
        },
        orderBy: {
          transactionDate: "desc",
        },
      });
    }

    if (transaction) {
      return res.status(200).json({ transaction, status: "success" });
    } else {
      return res.status(404).json({ status: "not_found", message: "Transaction not found" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;