import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const eventsRouter = router({
  getVerifiedEvents: publicProcedure.query(async ({ ctx }) => {
    const events = await ctx.prisma.event.findMany({
      where: { EventValidity: true },
    });
    return {
      events: events,
    };
  }),

  getEvents: protectedProcedure.query(async ({ ctx }) => {
    if (
      ctx?.session.user.email == "bradleygichuru@gmail.com" ||
      ctx?.session?.user?.email == "jasonmwai.k@gmail.com" ||
      ctx?.session?.user?.email == "roboboy84@gmail.com" ||
      ctx?.session?.user?.email == "Mwasnoah@gmail.com"
    ) {
      const events = await ctx.prisma.event.findMany({});
      return {
        events: events,
      };
    } else {
      return { unauthorized: true };
    }
  }),

  verifyEvent: protectedProcedure
    .input(z.object({ eventName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        ctx?.session.user.email == "bradleygichuru@gmail.com" ||
        ctx?.session?.user?.email == "jasonmwai.k@gmail.com" ||
        ctx?.session?.user?.email == "roboboy84@gmail.com" ||
        ctx?.session?.user?.email == "Mwasnoah@gmail.com"
      ) {
        const verifiedEvent = await ctx.prisma.event.update({
          where: { EventName: input?.eventName },
          data: { EventValidity: true },
        });
        if (verifiedEvent.EventValidity == true) {
          return { verification: "successful" };
        } else {
          return { verification: "unsuccessful" };
        }
      } else {
        return { unauthorized: true };
      }
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
        where: { EventOrganizer: input.eventOrganizer, EventValidity: true },
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
        mobileContact: z.string(),
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
          MobileContact: input.mobileContact,
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
