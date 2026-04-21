import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { auth } from "@/server/auth";
import { headers } from "next/headers";

const AUTHORIZED_EMAILS = [
  "bradleygichuru@gmail.com",
  "jasonmwai.k@gmail.com",
  "roboboy84@gmail.com",
  "mwasnoah@gmail.com",
];

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email || !AUTHORIZED_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ unauthorized: true }, { status: 401 });
    }

    const events = await prisma.event.findMany({});
    return NextResponse.json({ events });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ result: "an internal error occurred" }, { status: 500 });
  }
}