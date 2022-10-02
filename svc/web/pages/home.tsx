import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { WithAuth } from "../components/auth/auth";
import { trpc } from "../lib/hooks/trpc";

/**
 * TODO: move this to edge function, when clerk is ready
 */
export default function Page() {
  const sess = useSession()
  const router = useRouter();
  // const teams = trpc.team.list.useQuery();
  // const personalTeam = teams.data?.find((team) => team.role === "PERSONAL");
  // if (personalTeam) {
  //   router.push(`/${personalTeam.team.slug}`);
  // }

  return (
    // <WithAuth />
    <>
    Hello {sess.data?.user.id}
    </>
  );
}
