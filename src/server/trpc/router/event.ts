import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import Decimal from "decimal.js";

export const eventsRouter = router({
  getVerifiedEvents: publicProcedure.query(async ({ ctx }) => {
    try {
      const events = await ctx.prisma.event.findMany({
        where: { EventValidity: true },
      });
      return {
        events: events,
      };
    } catch (e) {
      console.error(e);
      return { result: "an internal error occured " };
    }
  }),

  getEvents: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (
        ctx?.session.user.email == "bradleygichuru@gmail.com" ||
        ctx?.session?.user?.email == "jasonmwai.k@gmail.com" ||
        ctx?.session?.user?.email == "roboboy84@gmail.com" ||
        ctx?.session?.user?.email == "mwasnoah@gmail.com"
      ) {
        const events = await ctx.prisma.event.findMany({});
        return {
          events: events,
        };
      } else {
        return { unauthorized: true };
      }
    } catch (e) {
      console.error(e);
      return { result: "an internal error occured " };
    }
  }),

  verifyEvent: protectedProcedure
    .input(z.object({ eventName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (
          ctx?.session.user.email == "bradleygichuru@gmail.com" ||
          ctx?.session?.user?.email == "jasonmwai.k@gmail.com" ||
          ctx?.session?.user?.email == "roboboy84@gmail.com" ||
          ctx?.session?.user?.email == "mwasnoah@gmail.com"
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
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured " };
      }
    }),
  invalidateEvent: protectedProcedure
    .input(z.object({ eventName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (
          ctx?.session.user.email == "bradleygichuru@gmail.com" ||
          ctx?.session?.user?.email == "jasonmwai.k@gmail.com" ||
          ctx?.session?.user?.email == "roboboy84@gmail.com" ||
          ctx?.session?.user?.email == "mwasnoah@gmail.com"
        ) {
          const verifiedEvent = await ctx.prisma.event.update({
            where: { EventName: input?.eventName },
            data: { EventValidity: false },
          });
          if (verifiedEvent.EventValidity == false) {
            return { verification: "successful" };
          } else {
            return { verification: "unsuccessful" };
          }
        } else {
          return { unauthorized: true };
        }
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured " };
      }
    }),

  getEvent: publicProcedure
    .input(z.object({ eventName: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const event = await ctx.prisma.event.findFirst({
          where: { EventName: input.eventName },
          include: { ticketTypes: true },
        });
        const quantity = Array.from(
          { length: event?.EventMaxTickets as number },
          (_, i) => i + 1
        );
        return {
          event: event,
          quantity,
        };
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured " };
      }
    }),
  getUserEvents: publicProcedure
    .input(z.object({ eventOrganizer: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const events = await ctx.prisma.event.findMany({
          where: { EventOrganizer: input.eventOrganizer, EventValidity: true },
          include: {
            ticketTypes: true,
            transactions: {
              where: { completed: true },
              include: { tickets: true },
            },
          },
        });
        events.forEach(async (event, index) => {
          const transactions = await ctx.prisma.transaction.findMany({
            where: { EventName: event?.EventName, completed: true },
          });
          const rev = new Decimal(0);
          const totalRev = transactions.reduce(
            (accumulator: Decimal, currentValue) =>
              accumulator.add(currentValue.TotalAmount),
            rev
          );
          await ctx.prisma.event.update({
            where: { EventName: event?.EventName },
            data: { TicketRevenue: totalRev },
          });
        });

        return { events: events };
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured " };
      }
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
        merch: z.array(
          z.object({
            merchandiseName: z.string(),
            merchandisePrice: z.number(),
            merchandisePoster: z.string(),
          })
        ),
        eventicketTypesParsed: z.array(
          z.object({ price: z.number(), title: z.string(), deadline: z.date() })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let event;
        if (input.merch.length !== 0) {
          event = await ctx.prisma.event.create({
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
                  data: [...input?.eventicketTypesParsed],
                },
              },
              Merchandise: { createMany: { data: [...input?.merch] } },
            },
          });
        } else if (input.merch.length == 0) {
          event = await ctx.prisma.event.create({
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
                  data: [...input?.eventicketTypesParsed],
                },
              },
            },
          });
        }
        if (event == null) {
          return { result: "an error occured submiting this event" };
        } else {
          return { result: "success" };
        }
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured submiting this event" };
      }
    }),
});
