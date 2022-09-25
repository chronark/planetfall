import { useUser } from "@clerk/nextjs";
import { Layout } from "../../components/app/layout/nav";
import { WithAuth } from "../../components/auth";

export default function TeamPage() {
  const { user } = useUser();
  const breadcrumbs = user?.username
    ? [{
      label: user.username,
      href: `/${user.username}`,
    }]
    : [];
  return (
    <Layout breadcrumbs={breadcrumbs}>
      <WithAuth>
        <div>
          <h1>{user?.username}</h1>
        </div>
      </WithAuth>
    </Layout>
  );
}
