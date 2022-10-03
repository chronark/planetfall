import { useRouter } from "next/router";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import JSXStyle from "styled-jsx/style";
import { trpc } from "../../lib/hooks/trpc";
import type { Membership, Team, User as PUser } from "@planetfall/db";

export type User = PUser & { teams: (Membership & { team: Team })[] };

export type Session = {
  userId?: string;
  signedIn: boolean;
  loading: boolean;
};

const Context = createContext<{
  session: Session;
  user: User | null;
}>({
  session: { signedIn: false, loading: true },
  user: null,
});

export type AuthProviderProps = {
  session?: Session;
};
export const AuthProvider: React.FC<PropsWithChildren> = (
  { children },
): JSX.Element => {
  const [session, setSession] = useState({ signedIn: false, loading: true });

  const [user, setUser] = useState<User | null>(null);
  const ctx = trpc.useContext();
  useEffect(() => {
    const run = async () => {
      const s = await ctx.auth.session.fetch();
      setSession({ ...s, loading: false });
      if (s.userId) {
        const u = await ctx.auth.user.fetch({ userId: s.userId });
        setUser(u);
      }
    };

    run();
  }, []);
  return (
    <Context.Provider value={{ session, user }}>
      {children}
    </Context.Provider>
  );
};

export function useSession() {
  const ctx = useContext(Context);

  const signOut = trpc.auth.signOut.useMutation().mutateAsync;

  return { session: ctx.session, signOut };
}

export function useUser() {
  const ctx = useContext(Context);
  const { data: user, ...meta } = trpc.auth.user.useQuery(
    { userId: ctx.session.userId! },
    { enabled: ctx.session.signedIn },
  );

  return { user, ...meta };
}

export const SignedIn: React.FC<PropsWithChildren> = (
  { children },
): JSX.Element | null => {
  const { session } = useSession();
  return session.signedIn ? <>{children}</> : null;
};

export const SignedOut: React.FC<PropsWithChildren> = (
  { children },
): JSX.Element | null => {
  const { session } = useSession();
  return session.signedIn ? null : <>{children}</>;
};
export const RedirectToSignIn: React.FC<PropsWithChildren> = (): null => {
  const { session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (!session.signedIn && !session.loading) {
      router.push("/auth/sign-in");
    }
  }, [router]);
  return null;
};
