export async function mutate<TReq, TRes>(path: string, req: TReq): Promise<TRes> {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
    },

    method: "POST",
    body: typeof req === "string" ? req : JSON.stringify(req),
  });
  return await res.json();
}
