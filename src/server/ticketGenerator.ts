import { prisma } from "../server/db/client";
import { createHash } from "crypto";
import generateQR from "../utils/base64gen";

export async function generateTicketsForTransaction(transactionId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { TransactionId: transactionId },
    include: { tickets: true },
  });

  if (!transaction || transaction.tickets.length > 0) {
    return null;
  }

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

  return await prisma.transaction.findUnique({
    where: { TransactionId: transactionId },
    select: {
      event: true,
      TransactionId: true,
      ticketTypeTitle: true,
      tickets: true,
      transactionDate: true,
    },
  });
}