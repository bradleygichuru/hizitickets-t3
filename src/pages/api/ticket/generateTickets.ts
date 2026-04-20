import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";
import { createHash } from "crypto";
import generateQR from "../../../utils/base64gen";

const bodySchema = z.object({
  transactionId: z.string(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "method not allowed" });
  }

  try {
    const { transactionId } = bodySchema.parse(req.body);

    const transaction = await prisma.transaction.findUnique({
      where: { TransactionId: transactionId },
      include: { tickets: true },
    });

    if (!transaction) {
      return res.status(404).json({ result: "transaction not found" });
    }

    if (transaction.tickets.length === 0) {
      const transactionHash = createHash("sha256")
        .update(
          `${transaction.Valid}${transaction.EventName}${transaction.TotalAmount}${transaction.MobileNumber}${transaction.TransactionId}${transaction.CheckoutRequestID}${transaction.TransactionMethod}${transaction.NumberOfTickets}${transaction.MerchantRequestID}`
        )
        .digest("hex");

      for (let i = 0; i < transaction.NumberOfTickets; i++) {
        const unhashedTicket = await prisma.ticket.create({
          data: {
            TransactionHash: transactionHash,
            TransactionId: transaction.TransactionId,
            ImageData: "",
          },
        });

        const ticketHash = createHash("sha256")
          .update(
            `${unhashedTicket.Scanned}${unhashedTicket.TicketId}${unhashedTicket.TicketHash}${unhashedTicket.TransactionHash}`
          )
          .digest("hex");

        const imageData = await generateQR(ticketHash);
        await prisma.ticket.update({
          where: { TicketId: unhashedTicket.TicketId },
          data: { TicketHash: ticketHash, ImageData: imageData },
        });
      }
    }

    const transactionWithTickets = await prisma.transaction.findUnique({
      where: { TransactionId: transactionId },
      select: {
        event: true,
        TransactionId: true,
        ticketTypeTitle: true,
        tickets: true,
        transactionDate: true,
      },
    });

    return res.status(200).json({ transaction: transactionWithTickets });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;