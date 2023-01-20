import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import axios from "axios";
import { createHash } from "crypto";
import generateQR from "../../../utils/base64gen";
const cK = "MN0MrspNCSebZAInOGIUQtCgjGdHzVcz";
const cS = "Iw3MraZkQEuGFROv";
const BusinessTill = 8071418;
const ShortCode = 6135122;
const passkey =
  "6e1b6160fb9604e2ea3ff0f283af8766372e261a7d9e98cf34486a107e145de2";
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
      const date = new Date();

      const timestamp =
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
      const password = Buffer.from(
        `${ShortCode}${passkey}${timestamp}`
      ).toString("base64");
      const instanceAuthToken = await axios({
        url: "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        method: "get",
        auth: {
          username: `${cK}`,
          password: `${cS}`,
        },
      }).catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
      console.log(instanceAuthToken?.data?.access_token);

      const buyRequest = await axios({
        url: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        data: {
          BusinessShortCode: ShortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerBuyGoodsOnline",
          Amount: input.totalAmount,
          PartyA: parseInt(`254${input?.mobileNumber}`),
          PartyB: BusinessTill,
          PhoneNumber: parseInt(`254${input.mobileNumber}`),
          CallBackURL: `https://www.hizitickets.com/api/mpesaCallback`,
          AccountReference: "hizitickets-enterprises",
          TransactionDesc: "Ticket Purchase",
        },
        method: "post",
        headers: {
          authorization: `Bearer ${instanceAuthToken?.data?.access_token}`,
        },
      }).catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
      console.log(buyRequest);
      let unconfirmedTransaction;
      if (buyRequest?.data?.ResponseCode == "0") {
        //TODO change this in prod
        unconfirmedTransaction = await ctx.prisma.transaction.create({
          data: {
            MobileNumber: `254${input.mobileNumber}`,
            EventName: input.eventName,
            TransactionMethod: "MPESA",
            NumberOfTickets: input.quantity,
            TotalAmount: input.totalAmount,
            MerchantRequestID: buyRequest?.data?.MerchantRequestID,
            CheckoutRequestID: buyRequest?.data?.CheckoutRequestID,
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
