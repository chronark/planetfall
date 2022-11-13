export async function mutate<TReq, TRes>(
  path: string,
  args: TReq,
): Promise<TRes> {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: typeof args === "string" ? args : JSON.stringify(args),
  });
  return await res.json();
}
