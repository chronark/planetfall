import { NextApiRequest, NextApiResponse } from "next";

export default function hello(req: NextApiRequest, res: NextApiResponse) {
  res.send("Hello");
}
