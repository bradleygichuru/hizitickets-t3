import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { z } from "zod";
import axios from "axios";
import { randomUUID } from "crypto";
import { env } from "../../../env/server.mjs";

const PAYGATE_API_BASE = "https://api.paygate.to";
const CHECKOUT_BASE = "https://checkout.paygate.to";

async function createPayGatePayment(totalAmount: number, email: string, transactionId: string) {
  const callbackUrl = env.PAYGATE_CALLBACK;
  const KES_TO_USD_RATE = 129.10;
  const usdAmount = Number((totalAmount / KES_TO_USD_RATE).toFixed(2));

  console.log("PayGate: Converting KES to USD:", totalAmount, "KES /", KES_TO_USD_RATE, "=", usdAmount, "USD");

  const walletUrl = `${PAYGATE_API_BASE}/control/wallet.php?address=${encodeURIComponent(env.PAYGATE_USDC_ADDRESS)}&callback=${encodeURIComponent(callbackUrl)}`;
  
  const walletResponse = await axios({
    url: walletUrl,
    method: "GET",
    headers: { "Accept": "application/json" },
  }).catch(err => {
    console.error("PayGate wallet error:", err.response?.data || err.message);
    throw err;
  });

  const encryptedAddress = walletResponse.data.address_in;
  const ipnToken = walletResponse.data.ipn_token;

  const paymentUrl = `${CHECKOUT_BASE}/process-payment.php?address=${encryptedAddress}&amount=${usdAmount}&provider=stripe&email=${encodeURIComponent(email)}&currency=USD`;

  return {
    ipn_token: ipnToken,
    payment_url: paymentUrl,
    usd_amount: usdAmount,
  };
}

const bodySchema = z.object({
  mobileNumber: z.union([z.number(), z.string()]),
  quantity: z.number(),
  ticketTypeTitle: z.string(),
  eventName: z.string(),
  totalAmount: z.number(),
  email: z.string(),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("buyTicket API called", req.body);
  
  if (req.method !== "POST") {
    return res.status(405).json({ result: "method not allowed" });
  }

  try {
    const input = bodySchema.parse(req.body);

    // Convert mobileNumber to string if it's a number
    const mobileNumberStr = String(input.mobileNumber);
    const mobileNumberClean = mobileNumberStr.replace(/^254/, '').replace(/^\+254/, '');
    
    console.log("Event lookup:", input.eventName);
    const event = await prisma.event.findFirst({
      where: { EventName: input.eventName },
    });

    if (event?.DemoMode) {
      const transaction = await prisma.transaction.create({
        data: {
          MobileNumber: `254${mobileNumberClean}`,
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
      return res.status(200).json({ transaction, status: "success" });
    }

    let transactionId = randomUUID();
    const existingById = await prisma.transaction.findUnique({
      where: { MerchantRequestID: transactionId },
    });
    if (existingById) {
      transactionId = randomUUID();
    }

    const existingPending = await prisma.transaction.findFirst({
      where: {
        MobileNumber: `254${mobileNumberClean}`,
        EventName: input.eventName,
        ticketTypeTitle: input.ticketTypeTitle,
        completed: false,
        cancelled: false,
      },
    });

    if (existingPending?.payment_url) {
      return res.status(200).json({
        transaction: existingPending,
        status: "pending_exists",
        paymentUrl: existingPending.payment_url,
      });
    }

    let paygateData;
    try {
      paygateData = await createPayGatePayment(input.totalAmount, input.email, transactionId);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        error: "Failed to create payment. Please try again.",
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        MobileNumber: `254${mobileNumberClean}`,
        EventName: input.eventName,
        TransactionMethod: "PAYGATE",
        NumberOfTickets: input.quantity,
        Valid: true,
        TotalAmount: input.totalAmount,
        MerchantRequestID: transactionId,
        CheckoutRequestID: transactionId,
        ticketTypeTitle: input.ticketTypeTitle,
        ipn_token: paygateData.ipn_token,
        payment_url: paygateData.payment_url,
        email: input.email,
      },
    });

    return res.status(200).json({
      transaction,
      status: "success",
      paymentUrl: paygateData.payment_url,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;