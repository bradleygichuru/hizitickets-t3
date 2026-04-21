import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { z } from "zod";

const bodySchema = z.object({
  merchantRequestID: z.string(),
});

export async function POST(request: Request) {
  try {
    const { merchantRequestID } = bodySchema.parse(await request.json());

    const transaction = await prisma.transaction.findUnique({
      where: { MerchantRequestID: merchantRequestID },
    });

    if (!transaction) {
      return NextResponse.json({ result: "transaction not found" }, { status: 404 });
    }

    await prisma.transaction.update({
      where: { TransactionId: transaction.TransactionId },
      data: { cancelled: true },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}