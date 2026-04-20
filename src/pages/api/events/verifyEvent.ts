import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { getSession } from "../../../utils/getSession";
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "method not allowed" });
  }

  try {
    const session = await getSession(req, res);
    
    if (!session?.user?.email || !AUTHORIZED_EMAILS.includes(session.user.email)) {
      return res.status(401).json({ unauthorized: true });
    }

    const { eventName } = bodySchema.parse(req.body);

    const verifiedEvent = await prisma.event.update({
      where: { EventName: eventName },
      data: { EventValidity: true },
    });

    if (verifiedEvent.EventValidity === true) {
      return res.status(200).json({ verification: "successful" });
    } else {
      return res.status(400).json({ verification: "unsuccessful" });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;