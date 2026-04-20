import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";

const querySchema = z.object({
  eventName: z.string(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { eventName } = querySchema.parse(req.query);

    const event = await prisma.event.findFirst({
      where: { EventName: eventName as string },
      include: { ticketTypes: true },
    });

    if (!event) {
      return res.status(404).json({ result: "event not found" });
    }

    const quantity = Array.from(
      { length: event.EventMaxTickets },
      (_, i) => i + 1
    );

    return res.status(200).json({ event, quantity });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;