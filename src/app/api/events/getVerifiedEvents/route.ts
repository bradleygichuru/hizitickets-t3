import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");

    const events = await prisma.event.findMany({
      where: { EventValidity: true },
      take: PAGE_SIZE + 1,
      cursor: cursor ? { EventId: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: "desc" },
    });

    let nextCursor: string | undefined;
    if (events.length > PAGE_SIZE) {
      const nextItem = events.pop();
      nextCursor = nextItem?.EventId;
    }

    return NextResponse.json({ events, nextCursor });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}
