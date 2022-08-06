import { createRouter } from "./context";
import { z } from "zod";

export const eventRouter = createRouter()
  .query("getEvents", {
    async resolve({ ctx }) {
      const events = await ctx.prisma.event.findMany({});
      console.log(events);
      return {
        events: events,
      };
    },
  })
  .query("getEvent", {
    input: z.object({ eventName: z.string() }),
    async resolve({ input, ctx }) {
      const event = await ctx.prisma.event.findFirst({
        where: { EventName: input.eventName },
        include: { ticketTypes: true,},
      });
      return {
        event: event,
      };
    },
  })
  .query("getUserEvents", {
    input: z.object({ eventOrganizer: z.string() }),
    async resolve({ ctx, input }) {
      const events = await ctx.prisma.event.findMany({
        where: { EventOrganizer: input.eventOrganizer },
        include: { ticketTypes: true, transactions: true },
      });
      events;
      return { events: events };
    },
  })
  .mutation("addEvent", {
    input: z.object({
      eventName: z.string(),
      eventDescription: z.string(),
      eventLocation: z.string(),
      eventMaxTickets: z.number(),
      eventPosterUrl: z.string(),
      eventOrganizer: z.string(),
      eventDate: z.date(),
      eventicketTypesParsed: z.array(
        z.object({ price: z.number(), title: z.string(), deadline: z.date() })
      ),
    }),
    async resolve({ input, ctx }) {
      const event = await ctx.prisma.event.create({
        data: {
          EventName: input.eventName,
          EventDate: input.eventDate,
          EventDescription: input.eventDescription,
          EventLocation: input.eventLocation,
          EventMaxTickets: input.eventMaxTickets,
          EventPosterUrl: input.eventPosterUrl,
          EventOrganizer: input.eventOrganizer,
          ticketTypes: {
            createMany: {
              data: [...input.eventicketTypesParsed],
            },
          },
        },
      });
      if (event == null) {
        return { result: "an error occured submiting this event" };
      } else {
        return { result: "success" };
      }
    },
  });
