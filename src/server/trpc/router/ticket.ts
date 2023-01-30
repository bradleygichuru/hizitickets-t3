import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { createHash } from "crypto";
import generateQR from "../../../utils/base64gen";
import {Mpesa} from "../../../utils/index"; 
const cK = "MN0MrspNCSebZAInOGIUQtCgjGdHzVcz";
const cS = "Iw3MraZkQEuGFROv";
const BusinessTill = 8071418;
const ShortCode = 6135122;
const passkey =
  "6e1b6160fb9604e2ea3ff0f283af8766372e261a7d9e98cf34486a107e145de2";
const mpesa = new Mpesa(ShortCode,passkey,cK,cS,"production");
export const ticketRouter = router({
  buyTicket: publicProcedure
    .input(
      z.object({
        mobileNumber: z.number(),
        quantity: z.number(),
        ticketTypeTitle: z.string(),
        eventName: z.string(),
        totalAmount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(input);
      let unconfirmedTransaction;
      
      const buyRequest = await mpesa.simulateStkPush(`${input.mobileNumber}`,input.totalAmount,"hizitickets-enterprises","Ticket Purchase","CustomerBuyGoodsOnline",BusinessTill,`https://www.hizitickets.com/api/mpesaCallback`);
      
      console.log(buyRequest);
    if (buyRequest?.ResponseCode == "0") {
        //TODO change this in prod
        unconfirmedTransaction = await ctx.prisma.transaction.create({
          data: {
            MobileNumber: `254${input.mobileNumber}`,
            EventName: input.eventName,
            TransactionMethod: "MPESA",
            NumberOfTickets: input.quantity,
            TotalAmount: input.totalAmount,
            MerchantRequestID: buyRequest?.MerchantRequestID,
            CheckoutRequestID: buyRequest?.CheckoutRequestID,
            ticketTypeTitle: input.ticketTypeTitle,
          },
        });

        return {
          transcation: unconfirmedTransaction,
          status: "success",
        };
      } else {
        return {
          status: "error",
        };
      }
    }),
  generateTickets: publicProcedure
    .input(z.object({ transactionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const transaction = await ctx.prisma.transaction.findUnique({
        where: { TransactionId: input.transactionId },
        include: { tickets: true },
      });
      if (transaction?.tickets.length == 0) {
        const transactionHash = createHash("sha256")
          .update(
            `${transaction?.Valid}${transaction?.EventName}${transaction?.TotalAmount}${transaction?.MobileNumber}${transaction?.TransactionId}${transaction?.CheckoutRequestID}${transaction?.TransactionMethod}${transaction?.NumberOfTickets}${transaction?.MerchantRequestID}`
          )
          .digest("hex");

        for (let i = 1; i <= transaction?.NumberOfTickets; i += 1) {
          const unhashedTicket = await ctx.prisma.ticket.create({
            data: {
              TransactionHash: transactionHash,
              TransactionId: transaction?.TransactionId,
              ImageData: "",
            },
          });

          const ticketHash = createHash("sha256")
            .update(
              `${unhashedTicket.Scanned}${unhashedTicket.TicketId}${unhashedTicket.TicketHash}${unhashedTicket.TransactionHash}`
            )
            .digest("hex");
          console.log(ticketHash);
          const imageData = await generateQR(ticketHash);
          await ctx.prisma.ticket.update({
            where: { TicketId: unhashedTicket.TicketId },
            data: { TicketHash: ticketHash, ImageData: imageData! },
          });
        }
        const transactionWithTickets = await ctx.prisma.transaction.findUnique({
          where: { TransactionId: input.transactionId },
          select: {
            event: true,
            TransactionId: true,
            ticketTypeTitle: true,
            tickets: true,
          },
        });
        return { transaction: transactionWithTickets };
      } else {
        const transaction = await ctx.prisma.transaction.findUnique({
          where: { TransactionId: input.transactionId },
          select: {
            event: true,
            TransactionId: true,
            ticketTypeTitle: true,
            tickets: true,
          },
        });
        return { transaction };
      }
    }),
  findMerchantId: publicProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        eventName: z.string(),
        ticketType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const transactions = await ctx.prisma.transaction.findMany({
        where: {
          MobileNumber: input.phoneNumber,
          EventName: input.eventName,
          ticketTypeTitle: input.ticketType,
        },
      });
      return transactions;
    }),
  fetchTicket: publicProcedure
    .input(z.object({ ticketHash: z.string() }))
    .query(async ({ input, ctx }) => {
      const ticket = await ctx.prisma.ticket.findFirst({
        where: { TicketHash: input.ticketHash },
        include: {
          transaction: {
            select: { ticketTypeTitle: true, EventName: true, Valid: true },
          },
        },
      });
      if (!ticket) {
        return { result: "qrcode invalid ticket doesnt exist" };
      }
      if (ticket?.transaction.Valid === true && ticket.Scanned == false) {
        const ticketScanned = await ctx.prisma.ticket.update({
          where: { TicketId: ticket.TicketId },
          data: { Scanned: true },
          include: {
            transaction: {
              select: { ticketTypeTitle: true, EventName: true, Valid: true },
            },
          },
        });
        if (ticketScanned.Scanned === true) {
          return {
            result: `ticket scanned of type ${ticketScanned.transaction.ticketTypeTitle}`,
          };
        }
      }
      if (ticket?.Scanned === true) {
        return {
          result: `ticket of type ${ticket.transaction.ticketTypeTitle} was already scanned`,
        };
      }
      if (ticket?.transaction.Valid == false) {
        return { result: "the transaction involved with ticket was not valid" };
      }
    }),
});
