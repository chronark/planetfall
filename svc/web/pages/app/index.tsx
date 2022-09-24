import { trpc } from "@planetfall/svc/web/lib/hooks/trpc";

export default function IndexPage() {
  const hello = trpc.hello.useQuery({ text: "client" });
  console.log({ hello });
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>{hello.data.greeting}</p>
    </div>
  );
}
