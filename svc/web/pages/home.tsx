import { useRouter } from "next/router";
import { useAuth } from "../components/auth/auth";
import slugify from "slugify";

/**
 * TODO: move this to edge function, when clerk is ready
 */
export default function Page() {
  const { user } = useAuth();
  const router = useRouter();

  if (user) {
    router.push(`/${slugify(user?.name)}`);
  }

  return (
    <>
      Hello {user?.name}
    </>
  );
}
