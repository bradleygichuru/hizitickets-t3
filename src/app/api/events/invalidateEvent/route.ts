import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { z } from "zod";

const AUTHORIZED_EMAILS = [
  "bradleygichuru@gmail.com",
  "jasonmwai.k@gmail.com",
  "roboboy84@gmail.com",
  "mwasnoah@gmail.com",
];

const bodySchema = z.object({
  eventName: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.email || !AUTHORIZED_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ unauthorized: true }, { status: 401 });
    }

    const { eventName } = bodySchema.parse(await request.json());

    const invalidatedEvent = await prisma.event.update({
      where: { EventName: eventName },
      data: { EventValidity: false },
    });

    if (invalidatedEvent.EventValidity === false) {
      return NextResponse.json({ verification: "successful" });
    } else {
      return NextResponse.json({ verification: "unsuccessful" }, { status: 400 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}