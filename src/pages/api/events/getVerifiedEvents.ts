import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const events = await prisma.event.findMany({
      where: { EventValidity: true },
    });
    return res.status(200).json({ events });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ result: "an internal error occured" });
  }
};

export default handler;