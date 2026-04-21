import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { auth } from "@/server/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { searchParams } = new URL(request.url);
    const eventOrganizer = searchParams.get("eventOrganizer");

    if (!session?.user?.name || session.user.name !== eventOrganizer) {
      return NextResponse.json({ unauthorized: true }, { status: 401 });
    }

    const events = await prisma.event.findMany({
      where: { EventOrganizer: eventOrganizer },
    });
    return NextResponse.json({ events });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}