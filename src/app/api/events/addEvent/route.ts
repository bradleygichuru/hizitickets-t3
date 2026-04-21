import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { z } from "zod";

const bodySchema = z.object({
  eventName: z.string(),
  eventDescription: z.string(),
  eventLocation: z.string(),
  eventMaxTickets: z.number(),
  eventPosterUrl: z.string(),
  eventPosterData: z.string().optional(),
  eventOrganizer: z.string(),
  mobileContact: z.string(),
  eventDate: z.string(),
  merch: z.array(
    z.object({
      merchandiseName: z.string(),
      merchandisePrice: z.number(),
      merchandisePoster: z.string(),
    })
  ),
  eventicketTypesParsed: z.array(
    z.object({ price: z.number(), title: z.string(), deadline: z.string() })
  ),
});

export async function POST(request: Request) {
  try {
    const input = bodySchema.parse(await request.json());

    const eventData: any = {
      EventName: input.eventName,
      EventDate: new Date(input.eventDate),
      EventDescription: input.eventDescription,
      EventLocation: input.eventLocation,
      EventMaxTickets: input.eventMaxTickets,
      EventPosterUrl: input.eventPosterUrl,
      EventPosterData: input.eventPosterData,
      EventOrganizer: input.eventOrganizer,
      MobileContact: input.mobileContact,
      ticketTypes: {
        createMany: {
          data: input.eventicketTypesParsed.map(t => ({
            ...t,
            deadline: new Date(t.deadline),
          })),
        },
      },
    };

    if (input.merch.length !== 0) {
      eventData.Merchandise = { createMany: { data: input.merch } };
    }

    const event = await prisma.event.create({
      data: eventData,
    });

    if (!event) {
      return NextResponse.json({ result: "an error occurred submitting this event" }, { status: 400 });
    }

    return NextResponse.json({ result: "success" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred submitting this event" }, { status: 500 });
  }
}