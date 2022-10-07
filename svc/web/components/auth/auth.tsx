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
import { resolveSoa } from "dns";
import { useSessionStorage } from "../../lib/hooks/storage";

export type User = PUser & { teams: (Membership & { team: Team })[] };

export type Session = {
  userId?: string;
  signedIn: boolean;
  loading: boolean;
};

const Context = createContext<{
  session: Session;
}>({
  session: { signedIn: false, loading: true },
});

export type AuthProviderProps = {
  session?: Session;
};
export const AuthProvider: React.FC<PropsWithChildren> = (
  { children },
): JSX.Element => {
  const [session, setSession] = useState<Session>({
    signedIn: false,
    loading: true,
  });

  const ctx = trpc.useContext();
  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/v1/auth/session");
      if (!res.ok) {
        return;
      }
      const json = await res.json() as {
        session: {
          user: { id: string; token: string; expries: number };
        } | null;
      };
      if (json.session) {
        setSession({
          userId: json.session.user.id,
          signedIn: true,
          loading: false,
        });
        if (json.session.user.id) {
          ctx.auth.user.prefetch({ userId: json.session.user.id });
        }
      } else {
        setSession({ signedIn: false, loading: false });
      }
    };

    run();
  }, []);
  return (
    <Context.Provider value={{ session }}>
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
    {
      enabled: ctx.session.signedIn,
    },
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
