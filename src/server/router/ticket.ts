import { z } from "zod";
import { createRouter } from "./context";
import axios from "axios";
import { env } from "../../env/server.mjs";
import { createHash } from "crypto";
import generateQR from "../../utils/base64gen";
const businessShortCode = 174379;
const passkey =
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
export const ticketRouter = createRouter()
  .mutation("buyTicket", {
    input: z.object({
      mobileNumber: z.number(),
      quantity: z.number(),
      ticketTypeTitle: z.string(),
      eventName: z.string(),
      totalAmount: z.number(),
    }),
    async resolve({ input, ctx }) {
      //let unconfirmedTransaction:Transaction;
      console.log(input);
      let date = new Date();
      var status: string;
      let timestamp =
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
      let password = Buffer.from(
        `${businessShortCode}${passkey}${timestamp}`
      ).toString("base64");
      const instanceAuthToken = await axios({
        url: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        method: "get",
        auth: {
          username: "Azs2KejU1ARvIL5JdJsARbV2gDrWmpOB",
          password: "hipGvFJbOxri330c",
        },
      });
      const buyRequest = await axios({
        url: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        data: {
          BusinessShortCode: businessShortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: 1,
          PartyA: parseInt(`254${input.mobileNumber}`),
          PartyB: businessShortCode,
          PhoneNumber: parseInt(`254${input.mobileNumber}`),
          CallBackURL: `${env.CALLBACK_URL}/api/trpc/ticket.callback?batch=1`,
          AccountReference: "2ddadaw",
          TransactionDesc: "Ticket Purchase",
        },
        method: "post",
        headers: {
          Authorization: `Bearer ${instanceAuthToken.data.access_token}`,
        },
      });
      let unconfirmedTransaction;
      if (buyRequest.data.ResponseCode == "0") {
        unconfirmedTransaction = await ctx.prisma.transaction.create({
          data: {
            MobileNumber: `254${input.mobileNumber}`,
            EventName: input.eventName,
            TransactionMethod: "MPESA",
            NumberOfTickets: input.quantity,
            TotalAmount: input.totalAmount,
            MerchantRequestID: buyRequest.data.MerchantRequestID,
            CheckoutRequestID: buyRequest.data.CheckoutRequestID,
            ticketTypeTitle: input.ticketTypeTitle,
          },
        });
      }
      return {
        transcation: unconfirmedTransaction,
      };
    },
  })
  .mutation("callback", {
    //TODO consider all edge cases when transactions fail
    async resolve({ ctx }) {
      console.log(ctx.req?.body);
      if (ctx.req?.body.stkCallback.ResultCode == 0) {
        await ctx.prisma.transaction.update({
          where: {
            MerchantRequestID: ctx.req?.body.stkCallback.MerchantRequestID,
          },
          data: { Valid: true },
        });
      } else {
        console.log("error");
      }
    },
  })
  .mutation("generateTickets", {
    //TODO prevent duplication of tickets
    input: z.object({ transactionId: z.string() }),
    async resolve({ input, ctx }) {
      const transaction = await ctx.prisma.transaction.findUnique({
        where: { TransactionId: input.transactionId },
      });
      const transactionHash = createHash("sha256")
        .update(
          `${transaction?.Valid}${transaction?.EventName}${transaction?.TotalAmount}${transaction?.MobileNumber}${transaction?.TransactionId}${transaction?.CheckoutRequestID}${transaction?.TransactionMethod}${transaction?.NumberOfTickets}${transaction?.MerchantRequestID}`
        )
        .digest("hex");

      for (let i = 0; i < transaction?.NumberOfTickets! - 1; i++) {
        const unhashedTicket = await ctx.prisma.ticket.create({
          data: {
            TransactionHash: transactionHash!,
            TransactionId: transaction?.TransactionId!,
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
        const ticketWithHash = await ctx.prisma.ticket.update({
          where: { TicketId: unhashedTicket.TicketId },
          data: { TicketHash: ticketHash, ImageData: imageData! },
        });

        //TODO test if works
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
    },
  })
  .query("fetchTicket", {
    input: z.object({ ticketHash: z.string() }),
    async resolve({ input, ctx }) {
      const ticket = await ctx.prisma.ticket.findFirst({
        where: { TicketHash: input.ticketHash },
        include: {
          transaction: {
            select: { ticketTypeTitle: true, EventName: true, Valid: true },
          },
        },
      });
      return{ ticket}
    }
  });
