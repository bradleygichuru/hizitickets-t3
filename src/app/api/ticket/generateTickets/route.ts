import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { z } from "zod";
import { createHash } from "crypto";
import generateQR from "@/utils/base64gen";

const bodySchema = z.object({
  transactionId: z.string(),
});

export async function POST(request: Request) {
  try {
    const { transactionId } = bodySchema.parse(await request.json());

    const transaction = await prisma.transaction.findUnique({
      where: { TransactionId: transactionId },
      include: { tickets: true },
    });

    if (!transaction) {
      return NextResponse.json({ result: "transaction not found" }, { status: 404 });
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
          data: {
            TicketHash: ticketHash,
            ImageData: imageData,
          },
        });
      }
    }

    const transactionWithTickets = await prisma.transaction.findUnique({
      where: { TransactionId: transactionId },
      include: { 
        tickets: true,
        event: true,
      },
    });

    return NextResponse.json({ transaction: transactionWithTickets });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}