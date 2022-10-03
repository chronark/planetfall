import { useRouter } from "next/router";
import { useSession, useUser } from "components/auth";
import slugify from "slugify";

/**
 * TODO: move this to edge function, when clerk is ready
 */
export default function Page() {
  useSession();
  const { user } = useUser();
  const router = useRouter();

  if (user) {
    router.push(`/${slugify(user?.name, { lower: true })}`);
  }

  return (
    <>
      Hello {user?.name}
    </>
  );
}
