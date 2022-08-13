import { z } from "zod";
import { createRouter } from "./context";
import axios from "axios";
import { env } from "../../env/server.mjs";

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
  });
