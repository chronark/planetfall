import { useRouter } from "next/router";
import { useSession, useUser } from "components/auth";
import slugify from "slugify";
import { Layout } from "../components/app/layout/nav";

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
    <Layout>
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-slate-300">
          Preparing ...
        </p>
      </div>
    </Layout>
  );
}
