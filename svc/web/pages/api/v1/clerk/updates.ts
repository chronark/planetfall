import type {NextApiRequest, NextApiResponse} from "next"
export default async function handler(req: NextApiRequest, res: NextApiResponse){


    console.log(JSON.stringify({
        headers: req.headers,
        body: req.body
    }))

}