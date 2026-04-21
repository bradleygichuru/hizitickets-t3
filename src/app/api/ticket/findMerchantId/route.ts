import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");
    const eventName = searchParams.get("eventName");
    const ticketType = searchParams.get("ticketType");

    const transactions = await prisma.transaction.findMany({
      where: {
        MobileNumber: phoneNumber as string,
        EventName: eventName as string,
        ticketTypeTitle: ticketType as string,
      },
    });

    return NextResponse.json(transactions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}