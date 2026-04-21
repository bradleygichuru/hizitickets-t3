import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketHash = searchParams.get("ticketHash");

    const ticket = await prisma.ticket.findFirst({
      where: { TicketHash: ticketHash as string },
      include: {
        transaction: {
          select: { ticketTypeTitle: true, EventName: true, Valid: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ result: "qrcode invalid ticket doesnt exist" });
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
        return NextResponse.json({
          result: `ticket scanned of type ${ticketScanned.transaction.ticketTypeTitle}`,
        });
      }
    }

    if (ticket.Scanned === true) {
      return NextResponse.json({
        result: `ticket of type ${ticket.transaction.ticketTypeTitle} was already scanned`,
      });
    }

    if (ticket.transaction.Valid === false) {
      return NextResponse.json({
        result: "the transaction involved with ticket was not valid",
      });
    }

    return NextResponse.json({ result: "unknown state" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}