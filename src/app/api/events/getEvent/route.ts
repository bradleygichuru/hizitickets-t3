import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { z } from "zod";

const querySchema = z.object({
  eventName: z.string(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventName = searchParams.get("eventName");

    if (!eventName) {
      return NextResponse.json({ result: "eventName is required" }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: { EventName: eventName },
      include: { ticketTypes: true },
    });

    if (!event) {
      return NextResponse.json({ result: "event not found" }, { status: 404 });
    }

    const quantity = Array.from(
      { length: event.EventMaxTickets },
      (_, i) => i + 1
    );

    return NextResponse.json({ event, quantity });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}