import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const eventsRouter = router({
  getEvents: publicProcedure.query(async ({ ctx }) => {
    const events = await ctx.prisma.event.findMany({});
    return {
      events: events,
    };
  }),
  getEvent: publicProcedure
    .input(z.object({ eventName: z.string() }))
    .query(async ({ input, ctx }) => {
      const event = await ctx.prisma.event.findFirst({
        where: { EventName: input.eventName },
        include: { ticketTypes: true },
      });
      return {
        event: event,
      };
    }),
  getUserEvents: publicProcedure
    .input(z.object({ eventOrganizer: z.string() }))
    .query(async ({ input, ctx }) => {
      const events = await ctx.prisma.event.findMany({
        where: { EventOrganizer: input.eventOrganizer },
        include: {
          ticketTypes: true,
          transactions: { include: { tickets: true } },
        },
      });
      return { events: events };
    }),
  addEvent: publicProcedure
    .input(
      z.object({
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
      })
    )
    .mutation(async ({ input, ctx }) => {
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
    }),
});
