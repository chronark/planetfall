"use client";
import { Heading } from "@/components/heading";
import { Loading } from "@/components/loading";
import { PageHeader } from "@/components/page";
import type { Region } from "@planetfall/db";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { useToast } from "@/components/toast";

type FormData = {
  url1: string;
  url2?: string;
  method: string;
  regions: string[];
};

type Props = {
  defaultValues: Partial<FormData>;
  signedIn: boolean;
};
export const Form: React.FC<Props> = ({ defaultValues, signedIn }): JSX.Element => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm<FormData>({ reValidateMode: "onSubmit", defaultValues });

  const [isLoading, setIsLoading] = useState(false);
  const _searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  async function submit(data: FormData) {
    setIsLoading(true);
    const urls = [data.url1];
    if (data.url2) {
      urls.push(data.url2);
    }
    await trpc.play.check
      .mutate({
        urls,
        method: data.method as any,
      })
      .then(({ shareId }) => {
        addToast({
          title: "All Checks are done",
          content: "Redirecting to results page",
        });
        router.push(`/play/${shareId}`);
      })
      .catch((err) => {
        addToast({
          title: "Error",
          content: (err as Error).message,
          variant: "error",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  return (
    <form onSubmit={handleSubmit(submit)}>
      <PageHeader
        sticky={true}
        title="Playground"
        description="Test your API endpoint from different regions for free."
        actions={[
          <Button key="submit" type="submit" variant="primary">
            {isLoading ? <Loading /> : "Check"}
          </Button>,
        ]}
      />

      <div className="container min-h-screen pb-20 mx-auto space-y-8 md:space-y-16">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-zinc-900">URL</h3>
              <p className="max-w-2xl mt-1 text-sm text-zinc-500">
                Enter the URL you want to check.
              </p>
            </div>

            {signedIn ? null : (
              <Link
                href="/auth/sign-in?to=/play"
                className="text-sm duration-150 text-zinc-500 hover:text-zinc-900"
              >
                Sign in to compare mutiple urls and analyse their performance difference.
              </Link>
            )}
          </div>
          <div className="mt-8 space-y-8 sm:space-y-5 lg:space-y-24 lg:mt-16">
            <div className="flex items-center justify-start overflow-hidden duration-300 ease-in-out border rounded border-zinc-900 group focus:border-zinc-900 hover:bg-zinc-50">
              <select
                {...register("method", { required: true })}
                className={
                  "transition-all  focus:bg-zinc-50 md:px-4 md:h-12  group-hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                }
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              <input
                type="url"
                {...register("url1", {
                  required: true,
                  validate: (v) => z.string().url().safeParse(v).success,
                })}
                placeholder="https://example.com"
                className={`transition-all flex-grow focus:bg-zinc-50 md:px-4 md:h-12 focus:outline-none  group-hover:bg-zinc-50  w-full ${
                  errors.url1 ? "border-red-500" : "border-zinc-700"
                }   focus:outline-none `}
              />
            </div>

            {errors.url1 ? (
              <p className="mt-2 text-sm text-red-500">
                {errors.url1.message || "A URL is required"}
              </p>
            ) : null}
          </div>
        </div>
        {signedIn ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-zinc-900">Compare</h3>
                <p className="max-w-2xl mt-1 text-sm text-zinc-500">
                  Optionally enter a second URL. This will run the same checks against both urls and
                  compare the results.
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-8 sm:space-y-5 lg:space-y-24 lg:mt-16">
              <div className="flex items-center justify-start overflow-hidden duration-300 ease-in-out border rounded border-zinc-900 group focus:border-zinc-900 hover:bg-zinc-50">
                <input
                  type="url"
                  {...register("url2", {
                    required: false,
                    validate: (v) => v === "" || z.string().url().safeParse(v).success,
                  })}
                  placeholder="https://example.com"
                  className={`transition-all flex-grow focus:bg-zinc-50 md:px-4 md:h-12 focus:outline-none  group-hover:bg-zinc-50  w-full ${
                    errors.url2 ? "border-red-500" : "border-zinc-700"
                  }   focus:outline-none `}
                />
              </div>

              {errors.url2 ? <p className="mt-2 text-sm text-red-500">{errors.url2.type}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
};
