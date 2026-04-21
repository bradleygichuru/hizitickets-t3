import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { EventValidity: true },
    });
    return NextResponse.json({ events });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}