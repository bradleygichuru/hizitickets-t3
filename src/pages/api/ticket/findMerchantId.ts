import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";

const querySchema = z.object({
  phoneNumber: z.string(),
  eventName: z.string(),
  ticketType: z.string(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { phoneNumber, eventName, ticketType } = querySchema.parse(req.query);

    const transactions = await prisma.transaction.findMany({
      where: {
        MobileNumber: phoneNumber as string,
        EventName: eventName as string,
        ticketTypeTitle: ticketType as string,
      },
    });

    return res.status(200).json(transactions);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;