import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
export async function getSession(): Promise<
	{ session: Session } | { session: null }
> {
	const session = await unstable_getServerSession(authOptions);
	return { session };
}
