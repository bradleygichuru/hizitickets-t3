import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";

const querySchema = z.object({
  ticketHash: z.string(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { ticketHash } = querySchema.parse(req.query);

    const ticket = await prisma.ticket.findFirst({
      where: { TicketHash: ticketHash as string },
      include: {
        transaction: {
          select: { ticketTypeTitle: true, EventName: true, Valid: true },
        },
      },
    });

    if (!ticket) {
      return res.status(200).json({ result: "qrcode invalid ticket doesnt exist" });
    }

    if (ticket.transaction.Valid === true && ticket.Scanned === false) {
      const ticketScanned = await prisma.ticket.update({
        where: { TicketId: ticket.TicketId },
        data: { Scanned: true },
        include: {
          transaction: {
            select: { ticketTypeTitle: true, EventName: true, Valid: true },
          },
        },
      });

      if (ticketScanned.Scanned === true) {
        return res.status(200).json({
          result: `ticket scanned of type ${ticketScanned.transaction.ticketTypeTitle}`,
        });
      }
    }

    if (ticket.Scanned === true) {
      return res.status(200).json({
        result: `ticket of type ${ticket.transaction.ticketTypeTitle} was already scanned`,
      });
    }

    if (ticket.transaction.Valid === false) {
      return res.status(200).json({
        result: "the transaction involved with ticket was not valid",
      });
    }

    return res.status(200).json({ result: "unknown state" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;