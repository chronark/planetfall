import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";


/**
 * TODO: move this to edge function, when clerk is ready
 */
export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  if (user?.username) {
    router.push(`/${user.username}`);
  }
  return (
    <>

    </>
  );
}
