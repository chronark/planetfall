import { Session, getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
export async function getSession(): Promise<{ session: Session } | { session: null }> {
  const session = await getServerSession(authOptions);
  return { session };
}
