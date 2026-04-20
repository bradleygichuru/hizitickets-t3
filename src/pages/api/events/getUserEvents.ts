import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";
import Decimal from "decimal.js";

const querySchema = z.object({
  eventOrganizer: z.string(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { eventOrganizer } = querySchema.parse(req.query);

    const events = await prisma.event.findMany({
      where: { EventOrganizer: eventOrganizer as string, EventValidity: true },
      include: {
        ticketTypes: true,
        transactions: {
          where: { completed: true },
          include: { tickets: true },
        },
      },
    });

    for (const event of events) {
      const transactions = await prisma.transaction.findMany({
        where: { EventName: event.EventName, completed: true },
      });
      const rev = new Decimal(0);
      const totalRev = transactions.reduce(
        (accumulator: Decimal, currentValue) =>
          accumulator.add(currentValue.TotalAmount),
        rev
      );
      await prisma.event.update({
        where: { EventName: event.EventName },
        data: { TicketRevenue: totalRev },
      });
    }

    return res.status(200).json({ events });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;