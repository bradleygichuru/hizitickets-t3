import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import axios from "axios";
import { createHash, randomUUID } from "crypto";
import generateQR from "../../../utils/base64gen";
import { env } from "../../../env/server.mjs";

const PAYGATE_API_BASE = "https://api.paygate.to";
const CHECKOUT_BASE = "https://checkout.paygate.to";

const cK = "MN0MrspNCSebZAInOGIUQtCgjGdHzVcz";
const cS = "Iw3MraZkQEuGFROv";
const BusinessTill = 8071418;
const ShortCode = 6135122;
const passkey =
  "6e1b6160fb9604e2ea3ff0f283af8766372e261a7d9e98cf34486a107e145de2";

async function createPayGatePayment(
  totalAmount: number,
  email: string,
  transactionId: string
) {
  // PayGate requires HTTPS callback - use production URL
  const callbackUrl = env.PAYGATE_CALLBACK;
  
  // Fixed exchange rate: 1 USD = 129.10 KES
  const KES_TO_USD_RATE = 129.10;
  const usdAmount = Number((totalAmount / KES_TO_USD_RATE).toFixed(2));
  
  console.log("PayGate: Converting KES to USD using flat rate:", totalAmount, "KES /", KES_TO_USD_RATE, "=", usdAmount, "USD");
  console.log("PayGate: Payout wallet:", env.PAYGATE_USDC_ADDRESS);
  console.log("PayGate: Callback URL:", callbackUrl);
  
  // Step 1: Generate wallet using correct params (match virtotp-monorepo)
  console.log("PayGate: Generating wallet...");
  const walletUrl = `${PAYGATE_API_BASE}/control/wallet.php?address=${encodeURIComponent(env.PAYGATE_USDC_ADDRESS)}&callback=${encodeURIComponent(callbackUrl)}`;
  console.log("PayGate: Wallet URL:", walletUrl);
  
  const walletResponse = await axios({
    url: walletUrl,
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  }).catch(err => {
    console.error("PayGate wallet error:", err.response?.data || err.message);
    throw err;
  });
  
  console.log("PayGate: Wallet response:", walletResponse.data);
  
  // Use address_in from response - it's already the encrypted address
  const encryptedAddress = walletResponse.data.address_in;
  const ipnToken = walletResponse.data.ipn_token;
  console.log("PayGate: Encrypted address (address_in):", encryptedAddress);
  console.log("PayGate: IPN token:", ipnToken);
  
  // Step 2: Build payment URL - DON'T encode address_in, it's already properly formatted
  const paymentUrl = `${CHECKOUT_BASE}/process-payment.php?address=${encryptedAddress}&amount=${usdAmount}&provider=stripe&email=${encodeURIComponent(email)}&currency=USD`;
  console.log("PayGate: Payment URL:", paymentUrl);
  
  return {
    ipn_token: ipnToken,
    payment_url: paymentUrl,
    usd_amount: usdAmount,
  };
}

export const ticketRouter = router({
  buyTicket: publicProcedure
    .input(
      z.object({
        mobileNumber: z.number(),
        quantity: z.number(),
        ticketTypeTitle: z.string(),
        eventName: z.string(),
        totalAmount: z.number(),
        email: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("buyTicket input:", input);
      const date = new Date();
      const event = await ctx.prisma.event.findFirst({
        where: { EventName: input?.eventName },
      });
      console.log("Event DemoMode:", event?.DemoMode);
      
      if (event?.DemoMode) {
        const transaction = await ctx.prisma.transaction.create({
          data: {
            MobileNumber: `254${input.mobileNumber}`,
            EventName: input.eventName,
            TransactionMethod: "PAYGATE",
            NumberOfTickets: input.quantity,
            Valid: true,
            DemoMode: true,
            TotalAmount: input.totalAmount,
            completed: true,
            MerchantRequestID: randomUUID(),
            CheckoutRequestID: randomUUID(),
            ticketTypeTitle: input.ticketTypeTitle,
            email: input.email,
          },
        });
        return {
          transaction,
          status: "success",
        };
      } else {
        let transactionId = randomUUID();
        
        // Verify this ID doesn't exist, regenerate if needed
        const existingById = await ctx.prisma.transaction.findUnique({
          where: { MerchantRequestID: transactionId },
        });
        if (existingById) {
          transactionId = randomUUID();
        }
        
        console.log("Creating PayGate payment for:", input.totalAmount, "KES to", input.email);
        
        // Check for existing pending transaction first
        const existingPending = await ctx.prisma.transaction.findFirst({
          where: {
            MobileNumber: `254${input.mobileNumber}`,
            EventName: input.eventName,
            ticketTypeTitle: input.ticketTypeTitle,
            completed: false,
            cancelled: false,
          },
        });
        
        if (existingPending?.payment_url) {
          return {
            transaction: existingPending,
            status: "pending_exists",
            paymentUrl: existingPending.payment_url,
          };
        }
        
        // Create PayGate payment
        let paygateData;
        try {
          paygateData = await createPayGatePayment(
            input.totalAmount,
            input.email,
            transactionId
          );
        } catch (error) {
          console.error("PayGate payment creation failed:", error);
          return {
            status: "error",
            error: "Failed to create payment. Please try again.",
          };
        }
        
        const unconfirmedTransaction = await ctx.prisma.transaction.create({
          data: {
            MobileNumber: `254${input.mobileNumber}`,
            EventName: input.eventName,
            TransactionMethod: "PAYGATE",
            NumberOfTickets: input.quantity,
            Valid: true,
            TotalAmount: input.totalAmount,
            MerchantRequestID: transactionId,
            CheckoutRequestID: transactionId, // Use our unique UUID to avoid constraint violation
            ticketTypeTitle: input.ticketTypeTitle,
            ipn_token: paygateData.ipn_token,
            payment_url: paygateData.payment_url,
            email: input.email,
          },
        });

        return {
          transaction: unconfirmedTransaction,
          status: "success",
          paymentUrl: paygateData.payment_url,
        };
      }
    }),
  generateTickets: publicProcedure
    .input(z.object({ transactionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
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
          [...Array(transaction?.NumberOfTickets)].forEach(async () => {
            {
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
                data: { TicketHash: ticketHash, ImageData: imageData },
              });
            }
          });
          const transactionWithTickets =
            await ctx.prisma.transaction.findUnique({
              where: { TransactionId: input.transactionId },
              select: {
                event: true,
                TransactionId: true,
                ticketTypeTitle: true,
                tickets: true,
                transactionDate: true,
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

              transactionDate: true,
            },
          });
          return { transaction };
        }
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured " };
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
      try {
        const transactions = await ctx.prisma.transaction.findMany({
          where: {
            MobileNumber: input.phoneNumber,
            EventName: input.eventName,
            ticketTypeTitle: input.ticketType,
          },
        });
        return transactions;
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured " };
      }
    }),
  fetchTicket: publicProcedure
    .input(z.object({ ticketHash: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
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
          return {
            result: "the transaction involved with ticket was not valid",
          };
        }
      } catch (e) {
        console.error(e);
        return { result: "an internal error occured " };
      }
    }),
});
