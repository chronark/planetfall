import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { trpc } from "../lib/hooks/trpc";

/**
 * TODO: move this to edge function, when clerk is ready
 */
export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const teams = trpc.team.list.useQuery();
  const personalTeam = teams.data?.find((team) => team.role === "PERSONAL");
  if (personalTeam) {
    router.push(`/${personalTeam.team.slug}`);
  }

  return (
    <>
    </>
  );
}
