import { useRouter } from "next/router";
import { useEffect } from "react";
import { trpc } from "../../lib/hooks/trpc";

export type User = {
  id: string;
  token: string;
  expires: number;
  name: string;
  image?: string | null;
};

export function useAuth({
  redirectTo = "/auth/sign-in",
} = {}) {
  const me = trpc.auth.me.useQuery();
  const signOut = trpc.auth.signOut.useMutation().mutateAsync;

  const router = useRouter();
  useEffect(() => {
    if (me.isLoading || me.isFetching) {
      return;
    }

    if (
      me.isError || !me.data || me.data.expires <= Date.now() || !me.data.userId
    ) {
      router.push(redirectTo);
    }
  }, [me.data, me.isFetching, me.isLoading, redirectTo]);

  return { user: me.data, signOut };
}
