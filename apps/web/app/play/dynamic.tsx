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
  regions: Region[];
  defaultValues: Partial<FormData>;
  signedIn: boolean;
};
export const Form: React.FC<Props> = ({
  defaultValues,
  regions: allRegions,
  signedIn,
}): JSX.Element => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    setValue,
  } = useForm<FormData>({ reValidateMode: "onSubmit", defaultValues });

  const vercelRegions = allRegions.filter((r) => r.platform === "vercelEdge");
  const awsRegions = allRegions.filter((r) => r.platform === "aws");
  const flyRegions = allRegions.filter((r) => r.platform === "fly");

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const _searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  async function submit(data: FormData) {
    if (selectedRegions.length === 0) {
      setError("regions", { message: "Select at least 1 region" });
    }
    setIsLoading(true);
    const urls = [data.url1];
    if (data.url2) {
      urls.push(data.url2);
    }
    await trpc.play.check
      .mutate({
        urls,
        method: data.method as any,
        regionIds: selectedRegions,
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

        {/* {signedIn ? (
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
        ) : null} */}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium leading-6 text-zinc-900">Regions</h3>
              <p className="max-w-2xl mt-1 text-sm text-zinc-500">
                Select the regions from where we should call your API.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                if (selectedRegions.length >= allRegions.length / 2) {
                  setSelectedRegions([]);
                } else {
                  setSelectedRegions(allRegions.map((r) => r.id));
                }
              }}
            >
              {selectedRegions.length >= allRegions.length / 2 ? "Deselect all" : "Select all"}
            </Button>
          </div>
          <div className="space-y-6 sm:space-y-5">
            <div role="group">
              <div className="sm:grid sm:items-baseline sm:gap-4">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h4 className="w-full mt-8 mb-4 font-medium leading-6 text-center md:mb-8 md:mt-16 text-zinc-900">
                      Vercel Edge
                    </h4>
                    <fieldset className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                      {vercelRegions.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          className={`flex justify-between items-center text-left border border-zinc-300 rounded overflow-hidden  hover:border-zinc-700 ${
                            selectedRegions.includes(r.id)
                              ? "border-zinc-900 bg-zinc-50"
                              : "border-zinc-300"
                          }`}
                          onClick={() => {
                            if (selectedRegions.includes(r.id)) {
                              setSelectedRegions(selectedRegions.filter((id) => id !== r.id));
                            } else {
                              setSelectedRegions([...selectedRegions, r.id]);
                            }
                          }}
                        >
                          <span className="px-2 py-1 lg:px-4">{r.name.replace("@edge", "")}</span>
                        </button>
                      ))}
                    </fieldset>
                  </div>

                  <div className="h-full">
                    <h4 className="w-full mt-8 mb-4 font-medium leading-6 text-center md:mb-8 md:mt-16 text-zinc-900">
                      Fly.io
                    </h4>

                    <fieldset className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                      {flyRegions.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          className={`flex justify-between items-center text-left border border-zinc-300 rounded overflow-hidden  hover:border-zinc-700 ${
                            selectedRegions.includes(r.id)
                              ? "border-zinc-900 bg-zinc-50"
                              : "border-zinc-300"
                          }`}
                          onClick={() => {
                            if (selectedRegions.includes(r.id)) {
                              setSelectedRegions(selectedRegions.filter((id) => id !== r.id));
                            } else {
                              setSelectedRegions([...selectedRegions, r.id]);
                            }
                          }}
                        >
                          <span className="px-2 py-1 lg:px-4">{r.name}</span>
                        </button>
                      ))}
                    </fieldset>
                  </div>
                  <div className="h-full">
                    <h4 className="w-full mt-8 mb-4 font-medium leading-6 text-center md:mb-8 md:mt-16 text-zinc-900">
                      AWS Lambda
                    </h4>

                    {awsRegions.length > 0 ? (
                      <fieldset className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                        {awsRegions.map((r) => (
                          <button
                            type="button"
                            key={r.id}
                            className={`flex justify-between items-center text-left border border-zinc-300 rounded overflow-hidden  hover:border-zinc-700 ${
                              selectedRegions.includes(r.id)
                                ? "border-zinc-900 bg-zinc-50"
                                : "border-zinc-300"
                            }`}
                            onClick={() => {
                              if (selectedRegions.includes(r.id)) {
                                setSelectedRegions(selectedRegions.filter((id) => id !== r.id));
                              } else {
                                setSelectedRegions([...selectedRegions, r.id]);
                              }
                            }}
                          >
                            <span className="px-2 py-1 lg:px-4">{r.name}</span>
                          </button>
                        ))}
                      </fieldset>
                    ) : (
                      <div className="flex items-center justify-center w-full p-8 border border-dashed rounded lg:p-24 border-zinc-300 ">
                        <Link href="/auth/sign-in">
                          <Button variant="primary" type="button">
                            Sign In to get access to AWS Lambda regions
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {errors.regions ? (
                <p className="mt-2 text-sm text-red-500">
                  {errors.regions.message || "Select at least one region"}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
