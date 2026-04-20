import { type NextApiRequest, type NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

import { authOptions } from "../server/auth";

export const getSession = async (req: NextApiRequest, res: NextApiResponse) => {
  return await unstable_getServerSession(req, res, authOptions);
};