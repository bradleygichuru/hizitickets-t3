import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { z } from "zod";
import axios from "axios";
import { randomUUID } from "crypto";
import { env } from "@/env/server.mjs";

const PAYGATE_API_BASE = "https://api.paygate.to";
const CHECKOUT_BASE = "https://checkout.paygate.to";

async function createPayGatePayment(totalAmount: number, email: string, transactionId: string) {
  const callbackUrl = env.PAYGATE_CALLBACK;
  const KES_TO_USD_RATE = 129.10;
  const usdAmount = Number((totalAmount / KES_TO_USD_RATE).toFixed(2));

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

export async function POST(request: Request) {
  try {
    const input = bodySchema.parse(await request.json());
    const mobileNumber = String(input.mobileNumber);

    const ticketType = await prisma.ticketTypes.findFirst({
      where: {
        title: input.ticketTypeTitle,
        event: { EventName: input.eventName },
      },
    });

    if (!ticketType) {
      return NextResponse.json({ result: "ticket type not found" }, { status: 404 });
    }

    const total = ticketType.price * input.quantity;

    const transaction = await prisma.transaction.create({
      data: {
        MobileNumber: mobileNumber,
        ticketTypeTitle: input.ticketTypeTitle,
        EventName: input.eventName,
        TransactionMethod: "PayGate",
        NumberOfTickets: input.quantity,
        MerchantRequestID: randomUUID(),
        CheckoutRequestID: randomUUID(),
        TotalAmount: total,
        email: input.email,
      },
    });

    if (!transaction) {
      return NextResponse.json({ result: "failed to create transaction" }, { status: 500 });
    }

    const paymentData = await createPayGatePayment(total, input.email, transaction.TransactionId);

    await prisma.transaction.update({
      where: { TransactionId: transaction.TransactionId },
      data: {
        payment_url: paymentData.payment_url,
        ipn_token: paymentData.ipn_token,
      },
    });

    return NextResponse.json({
      transactionId: transaction.TransactionId,
      paymentUrl: paymentData.payment_url,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}