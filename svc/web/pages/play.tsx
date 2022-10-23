import { Divider, message } from "antd";
import ms from "ms";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, Loading, PageHeader, Stats, Trace } from "../components";
import { Heading } from "../components/heading";
import { Header } from "../components/landing";
import { trpc } from "../lib/hooks/trpc";
import * as Tabs from "@radix-ui/react-tabs";

type FormData = {
  url: string;
  method: string;
  regions: string[];
};
const Play: NextPage = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    setValue,
  } = useForm<
    FormData
  >({ reValidateMode: "onSubmit" });

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const check = trpc.check.play.useMutation();
  const regions = trpc.region.list.useQuery();
  const router = useRouter();
  async function submit(
    data: FormData,
  ) {
    if (selectedRegions.length === 0) {
      setError("regions", { message: "Select at least 1 region" });
    }
    try {
      await check.mutateAsync({
        method: data.method,
        url: data.url,
        regionIds: selectedRegions,
      });
    } catch (err) {
      console.error(err);
      message.error((err as Error).message);
    }
  }

  useEffect(() => {
    let params = 0;
    const { method, url, regions } = router.query;
    if (method && typeof method === "string") {
      setValue("method", method.toUpperCase());
      params++;
    }
    if (url && typeof url === "string") {
      setValue("url", url);
      params++;
    }
    if (regions && typeof regions === "string") {
      setSelectedRegions(regions.split(","));
      params++;
    }

    if (params === 3) {
      check.mutate({
        method: method as string,
        url: url as string,
        regionIds: (regions as string).split(","),
      });
    }
  }, [router.query]);

  return (
    <div className="min-h-screen container mx-auto pb-20">
      <PageHeader
        sticky
        title="Planetfall Playground"
        description="Check your API manually"
        actions={[
          <button
            key="submit"
            type="button"
            onClick={handleSubmit(submit)}
            className="transition-all hover:cursor-pointer whitespace-nowrap md:px-4 py-2 font-medium inline-flex items-center justify-center md:border border-slate-900 rounded leading-snug duration-300 ease-in-out md:bg-slate-900 md:text-slate-50 md:hover:bg-slate-50 hover:text-slate-900  shadow-sm group"
          >
            {check.isLoading ? <Loading /> : "Check"}
          </button>,
        ]}
      />

      {check.data
        ? (
          <div>
            <Heading h2>Results</Heading>
            <Tabs.Root defaultValue={check.data[0].region.id}>
              <Tabs.List className="flex w-full ">
                {check.data.map((r) => (
                  <Tabs.Trigger
                    key={r.region.id}
                    value={r.region.id}
                    className="text-slate-500 border-b border-slate-200 hover:border-slate-600 hover:text-slate-900 radix-state-active:text-slate-900 radix-state-active:border-slate-500  py-2 px-3 inline-flex duration-150 transition-all items-center text-sm font-medium"
                  >
                    {r.region.name}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <div className="mt-4">
                {check.data.map((r) => (
                  <Tabs.Content key={r.region.id} value={r.region.id}>
                    <Card>
                      <Card.Header>
                        <Card.Header.Title
                          title={r.region.name}
                          subtitle={
                            <div className="flex items-center gap-1">
                              <span className="text-sm">
                                {r.method.toUpperCase()}
                              </span>
                              <Link href={r.url}>{r.url}</Link>
                            </div>
                          }
                        />
                      </Card.Header>
                      <Card.Content>
                        <div className="flex flex-col md:flex-row justify-between divide-y md:divide-y-0 md:divide-x  w-full">
                          {r.checks.sort((a, b) =>
                            a.time - b.time
                          ).map((c, i) => (
                            <div
                              key={i}
                              className={`${r.checks.length > 1 ? "w-1/2" : "w-full"} p-4 flex flex-col divide-y divide-slate-200`}
                            >
                              <div className="flex flex-col justify-between items-center">
                                {r.checks.length>1?<Heading h3>
                                  {i === 0 ? "Cold" : "Hot"}
                                </Heading>:null}
                                <div className="flex">
                                  <Stats
                                    label="Latency"
                                    value={c.latency}
                                    suffix="ms"
                                  />

                                  <Stats
                                    label="Status"
                                    value={c.status}
                                  />
                                </div>
                              </div>
                              <div className="py-4 md:py-8">
                                <Heading h4>Trace</Heading>

                                <Trace timings={c.timing} />
                              </div>
                              <div className="py-4 md:py-8">
                                <Heading h4>Response Header</Heading>
                                <pre className="rounded p-2 bg-slate-50">
                                  {JSON.stringify(c.headers, null, 2)}
                                </pre>
                              </div>
                              <div className="py-4 md:py-8">
                                <Heading h4>Response Body</Heading>
                                <pre className="rounded p-2 bg-slate-50">
                                  {atob(c.body)}


                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card.Content>
                    </Card>
                  </Tabs.Content>
                ))}
              </div>
            </Tabs.Root>

            <Divider />
          </div>
        )
        : null}
      <form className="space-y-8 divide-y divide-slate-200">
        <div className="space-y-8  sm:space-y-5 lg:space-y-24">
          <div className="space-y-6 sm:space-y-5">
            <div>
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                URL
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Enter the url of your endpoint and select a HTTP method
              </p>
            </div>

            <div className="space-y-6 sm:space-y-5">
              <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
                <label
                  htmlFor="method"
                  className="block sm:col-span-2 text-sm font-medium text-slate-700 sm:mt-px sm:pt-2"
                >
                  Method
                </label>
                <div className="mt-1 sm:col-span-4 sm:mt-0">
                  <div className="">
                    <select
                      {...register("method", { required: true })}
                      className={`transition-all  focus:bg-slate-50 md:px-4 md:h-12 w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
                <label
                  htmlFor="url"
                  className="block sm:col-span-2 text-sm font-medium text-slate-700 sm:mt-px sm:pt-2"
                >
                  URL
                </label>
                <div className="mt-1 sm:col-span-4 sm:mt-0">
                  <div className="">
                    <input
                      type="text"
                      {...register("url", {
                        required: true,
                        validate: (v) => z.string().url().safeParse(v).success,
                      })}
                      placeholder="https://example.com"
                      className={`transition-all  focus:bg-slate-50 md:px-4 md:h-12  w-full ${errors.url ? "border-red-500" : "border-slate-700"
                        } hover:border-slate-900 focus:border-slate-900  border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
                    />
                  </div>
                  {errors.url
                    ? (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.url.message || "A URL is required"}
                      </p>
                    )
                    : null}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 divide-y divide-slate-200 pt-8 sm:space-y-5 sm:pt-10">
            <div>
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                Regions
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Select the regions from where we should call your API.
              </p>
            </div>
            <div className="space-y-6 divide-y divide-slate-200 sm:space-y-5">
              <div className="pt-6 sm:pt-5">
                <div role="group" aria-labelledby="label-email">
                  <div className="sm:grid sm:items-baseline sm:gap-4">
                    <div className="mt-4 sm:col-span-3 sm:mt-0">
                      <fieldset className="w-full gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4  lg:grid-cols-6">
                        {regions.data?.map((r) => (
                          <button
                            type="button"
                            key={r.id}
                            className={`text-left border rounded px-2 lg:px-4 py-1 hover:border-slate-700 ${selectedRegions.includes(r.id)
                                ? "border-slate-900 bg-slate-50"
                                : "border-slate-300"
                              }`}
                            onClick={() => {
                              if (selectedRegions.includes(r.id)) {
                                setSelectedRegions(
                                  selectedRegions.filter((id) => id !== r.id),
                                );
                              } else {
                                setSelectedRegions([...selectedRegions, r.id]);
                              }
                            }}
                          >
                            {r.name}
                          </button>
                        ))}
                      </fieldset>
                      {errors.regions
                        ? (
                          <p className="mt-2 text-sm text-red-500">
                            {errors.regions.message ||
                              "Select at least one region"}
                          </p>
                        )
                        : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Play;
