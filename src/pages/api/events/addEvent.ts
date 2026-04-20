import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "method not allowed" });
  }

  try {
    const input = bodySchema.parse(req.body);

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
      return res.status(400).json({ result: "an error occured submiting this event" });
    }

    return res.status(200).json({ result: "success" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured submiting this event" });
  }
};

export default handler;