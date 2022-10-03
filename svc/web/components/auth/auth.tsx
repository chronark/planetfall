import { useRouter } from "next/router";
import React, { createContext, PropsWithChildren, useEffect } from "react";
import { trpc } from "../../lib/hooks/trpc";
import type { User } from "@planetfall/db";

export type User = {
  id: string;
  token: string;
  expires: number;
  name: string;
  image?: string | null;
};

const ERR_AUTHPROVIDER_INIT = new Error("Please wrap your app with the AuthProvider")

export type Session = {
  userId: string,
  signedIn: true
} | {
  userId?: never
  signedIn: false
}

const Context = createContext<{
  user?: User,
  session: Session,
  signOut: () => Promise<void>
}>({
  user: undefined,
  session: { signedIn: false },
  signOut: async () => { throw ERR_AUTHPROVIDER_INIT },
})


export const AuthProvider: React.FC<PropsWithChildren<{ session?: Session, user?: User }>> = ({ children, session, user }): JSX.Element => {
  return <Context.Provider value={{ session, user }}>{children}</Context.Provider>;
}






export function useAuth({ redirectTo = "/auth/sign-in" }) {

  const router = useRouter();
  const session = trpc.auth.session.useQuery({} as any, { initialData: { signedIn: false } });

  if (typeof session.data?.signedIn === "boolean" && !session.data.signedIn) {
    router.push(redirectTo);
  }

  const user = trpc.auth.user.useQuery(
    { userId: session.data!.userId! },
    { enabled: session.data?.signedIn },
  )

  const signOut = trpc.auth.signOut.useMutation().mutateAsync;

  return { user: user.data, session: session.data, signOut };
}
