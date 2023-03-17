import Link from "next/link";
import { Button } from "@/components/button";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-full px-6 py-24 bg-white place-items-center sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-zinc-900">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-zinc-600">
          Playground checks are only stored for 7 days for. Or 90 days if you are signed-in when
          running the check.
        </p>
        <div className="flex items-center justify-center mt-10 gap-x-6">
          <Link href="mailto:support@planetfall.io">
            <Button>Contact support</Button>
          </Link>
          <Link href="/home">
            <Button variant="primary">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
