import type { NextApiRequest, NextApiResponse } from "next";
import {z} from "zod"


const validation = z.object({
  headers: z.object({

  }),
  body: z.object({
    data: z.object({
      id: z.string(),
      username: z.string()
    }),
    object: z.string().refine((v) => v === "event"),
    type: z.string().refine((v) => v === "user.created"),
  })
  
})


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log(JSON.stringify({
    headers: req.headers,
    body: req.body,
  }));
}
