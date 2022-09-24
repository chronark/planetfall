import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  try {
    const path = req.query.path;
    if (!path) {
      res.status(500).send("path not set");
      return;
    }
    console.log(path);
    await res.revalidate(`/${Array.isArray(path) ? path.join("/") : path}`);
    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
  }
}
