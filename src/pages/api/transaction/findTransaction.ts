import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";

const querySchema = z.object({
  mpesaTransCode: z.string(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { mpesaTransCode } = querySchema.parse(req.query);

    const transaction = await prisma.transaction.findFirst({
      where: { mpesaReceiptNumber: mpesaTransCode as string },
    });

    if (transaction) {
      return res.status(200).json({ transaction, status: "success" });
    } else {
      return res.status(200).json({ status: "failed" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;