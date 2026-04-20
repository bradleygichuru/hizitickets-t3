import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";
import { getSession } from "../../../utils/getSession";

const AUTHORIZED_EMAILS = [
  "bradleygichuru@gmail.com",
  "jasonmwai.k@gmail.com",
  "roboboy84@gmail.com",
  "mwasnoah@gmail.com",
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req, res);
    
    if (!session?.user?.email || !AUTHORIZED_EMAILS.includes(session.user.email)) {
      return res.status(401).json({ unauthorized: true });
    }

    const events = await prisma.event.findMany({});
    return res.status(200).json({ events });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;