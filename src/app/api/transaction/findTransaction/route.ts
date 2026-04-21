import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mpesaTransCode = searchParams.get("mpesaTransCode");

    if (!mpesaTransCode) {
      return NextResponse.json({ result: "mpesaTransCode is required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: { mpesaReceiptNumber: mpesaTransCode },
    });

    if (transaction) {
      return NextResponse.json({ transaction, status: "success" });
    } else {
      return NextResponse.json({ status: "failed" });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}