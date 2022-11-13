"use client";
import { Region } from "@planetfall/db";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import Link from "next/link";
import { z } from "zod";
import { MinusSmallIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { useRouter } from "next/navigation";
import type { Input as Req, Output as Res } from "pages/api/v1/endpoints";
import { mutate } from "lib/api/call";
type Props = {
  teamId: string;
  teamSlug: string;
  regions: Region[];
};

type FormData = {
  name: string;
  url: string;
  method: "POST" | "GET" | "PUT" | "DELETE";
  headers?: string;
  body?: string;
  degradedAfter?: number;
  interval: number;
  distribution: "ALL" | "RANDOM";
  regions: string[];
  statusAssertions: {
    comparison: "gt" | "lt" | "eq" | "lte" | "gte";
    target: number;
  }[];
};

export const Form: React.FC<Props> = ({ teamSlug, teamId, regions }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    getValues,
    control,
    watch,
  } = useForm<FormData>({ reValidateMode: "onSubmit" });

  const router = useRouter();

  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // const createEndpoint = trpc.endpoint.create.useMutation();

  const [loading, setLoading] = useState(false);
  const statusAssertions = useFieldArray({
    control,
    name: "statusAssertions",
  });
  // useEffect(() => {
  //   if (statusAssertions.fields.length === 0) {
  //     statusAssertions.append({ comparison: "GTE", target: 200 })
  //   }
  // }, [])

  async function submit(data: FormData) {
    if (selectedRegions.length === 0) {
      setError("regions", { message: "Select at least 1 region" });
    }
    setLoading(true);
    try {
      const res = await mutate<Req["body"], Res>("/api/v1/endpoints", {
        name: data.name,
        method: data.method,
        url: data.url,
        body: data.body,
        headers: data.headers ? JSON.parse(data.headers) : undefined,
        degradedAfter: data.degradedAfter || undefined,
        interval: data.interval * 1000,
        regionIds: selectedRegions,
        distribution: data.distribution,
        teamSlug,
        statusAssertions: data.statusAssertions,
      });

      if (res.error) {
        console.error(res.error);
        throw new Error(res.error.message);
      }

      const { id } = await res.data;

      router.push(`/${teamSlug}/endpoints/${id}`);
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const formValues = watch();
  const monthlyRequests =
    ((formValues.distribution === "ALL" ? selectedRegions.length : 1) *
        30 *
        24 *
        60 *
        60) /
      formValues.interval || 0;

  return (
    <form className="space-y-8 divide-y divide-slate-200">
      <div className="space-y-8  sm:space-y-5 lg:space-y-24">
        <div className="space-y-6 sm:space-y-5">
          <div>
            <h3 className="text-lg font-medium leading-6 text-slate-900">
              Name
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Enter a name to make it easier to find this endpoint later
            </p>
          </div>

          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
              <label
                htmlFor="name"
                className="sm:col-span-2 block text-sm font-medium text-slate-700 sm:mt-px sm:pt-2"
              >
                Name
              </label>
              <div className="mt-1 sm:col-span-4 sm:mt-0">
                <div className="">
                  <input
                    type="text"
                    {...register("name", {
                      required: true,
                    })}
                    placeholder="My API"
                    className={`transition-all  focus:bg-slate-50 md:px-4 md:h-12  w-full ${
                      errors.url ? "border-red-500" : "border-slate-700"
                    } hover:border-slate-900 focus:border-slate-900  border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
                  />
                </div>
                {errors.name
                  ? (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.name.message || "A Name is required"}
                    </p>
                  )
                  : null}
              </div>
            </div>
          </div>
        </div>
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
                    className={"transition-all  focus:bg-slate-50 md:px-4 md:h-12 w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow"}
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
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
                    className={`transition-all  focus:bg-slate-50 md:px-4 md:h-12  w-full ${
                      errors.url ? "border-red-500" : "border-slate-700"
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

        <div className="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
          <div>
            <h3 className="text-lg font-medium leading-6 text-slate-900">
              Request
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Configure what is being sent to your API
            </p>
          </div>

          <div className="space-y-6 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
              <label
                htmlFor="body"
                className="sm:col-span-2 block text-sm font-medium text-slate-700 sm:mt-px sm:pt-2"
              >
                Body
              </label>
              <div className="mt-1  sm:col-span-4 sm:mt-0">
                <textarea
                  rows={3}
                  disabled={!["POST", "PUT"].includes(formValues.method)}
                  {...register("body")}
                  className={`transition-all  focus:bg-slate-50 md:px-4 px-2 py-1 md:py-3  w-full ${
                    errors.body ? "border-red-500" : "border-slate-700"
                  } ${
                    ["POST", "PUT"].includes(formValues.method)
                      ? ""
                      : "cursor-not-allowed"
                  } hover:border-slate-900 focus:border-slate-900   border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
                  defaultValue={""}
                  placeholder={["POST", "PUT"].includes(formValues.method)
                    ? undefined
                    : "Only available in POST or PUT requests"}
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
              <label
                htmlFor="last-name"
                className="block sm:col-span-2 text-sm font-medium text-slate-700 sm:mt-px sm:pt-2"
              >
                Headers
              </label>
              <div className="mt-1  sm:col-span-4 sm:mt-0">
                <textarea
                  rows={3}
                  {...register("headers", {
                    validate: (v) => (v ? JSON.parse(v) : true),
                  })}
                  placeholder={`{\n  "Authorization": "Bearer XXX"\n}`}
                  className={`transition-all  focus:bg-slate-50 md:px-4 px-2 py-1 md:py-3  w-full ${
                    errors.headers ? "border-red-500" : "border-slate-700"
                  } hover:border-slate-900 focus:border-slate-900  border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
                  defaultValue={""}
                />
                {errors.headers
                  ? (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.headers.message || "Headers are invalid"}
                    </p>
                  )
                  : null}
                <p className="mt-2 text-sm text-slate-500">
                  Headers can be configured using JSON notation
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 divide-y divide-slate-200 pt-8 sm:space-y-5 sm:pt-10">
          <div>
            <h3 className="text-lg font-medium leading-6 text-slate-900">
              Assertions
            </h3>
            <p className="mt-1  text-sm text-slate-500">
              Define validations and latency thresholds
            </p>
          </div>
          <div className="space-y-6 divide-y divide-slate-200 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
              <div className=" sm:col-span-2 ">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-slate-700 sm:mt-px sm:pt-2"
                >
                  Degraded After
                </label>
                <p className="mt-1 text-sm font-normal text-slate-500">
                  After this time the API is considered degraded and alerts can
                  be sent.
                </p>
              </div>
              <div className="mt-1  flex sm:col-span-4 sm:mt-0">
                <div className="group relative flex flex-grow items-stretch focus-within:z-10">
                  <input
                    type="number"
                    {...register("degradedAfter", {
                      valueAsNumber: true,
                      min: 1,
                    })}
                    placeholder="600"
                    className="block w-full rounded-none rounded-l transition-all  group-focus:bg-slate-50 md:px-4 md:h-12  border-slate-900 border border-r-0 hover:bg-slate-50 duration-300 ease-in-out focus:outline-none "
                  />
                </div>
                <div className="relative -ml-px inline-flex items-center space-x-2 rounded-r border border-l-0 border-slate-900 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ">
                  <span>ms</span>
                </div>
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
              <label
                htmlFor="status"
                className="block text-sm sm:col-span-2 font-medium text-slate-700 sm:mt-px sm:pt-2"
              >
                Status
              </label>
              <div className="mt-1 sm:col-span-4 sm:mt-0 space-y-4">
                {statusAssertions.fields.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-4">
                    <select
                      {...register(`statusAssertions.${i}.comparison`, {
                        required: true,
                      })}
                      className={"transition-all  focus:bg-slate-50 md:px-4 md:h-12 w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow"}
                    >
                      <option value="gte">Greater than or equal</option>
                      <option value="lte">Less than or equal</option>
                      <option value="eq">Equal</option>
                    </select>
                    <input
                      type="number"
                      {...register(`statusAssertions.${i}.target`, {
                        required: true,
                        valueAsNumber: true,
                      })}
                      className={"transition-all  focus:bg-slate-50 md:px-4 md:h-12 w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow"}
                    />
                    <div>
                      <Button
                        type="secondary"
                        square={true}
                        onClick={() =>
                          statusAssertions.remove(i)}
                        size="lg"
                        icon={<MinusSmallIcon className="w-6 h-6" />}
                      />
                    </div>
                  </div>
                ))}

                <div className="w-full">
                  <Button
                    type="tertiary"
                    onClick={() =>
                      statusAssertions.append({
                        comparison: "eq",
                        target: 200,
                      })}
                    size="lg"
                    block={true}
                    icon={<PlusIcon className="w-6 h-6" />}
                  />
                </div>
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
              Select the regions from where we should call your API. We will
              either call your API from all regions in parallel, or one region
              at a time.
            </p>
          </div>
          <div className="space-y-6 divide-y divide-slate-200 sm:space-y-5">
            <div className="pt-6 sm:pt-5">
              <div role="group" aria-labelledby="label-email">
                <div className="sm:grid sm:items-baseline sm:gap-4">
                  <div className="mt-4 sm:col-span-3 sm:mt-0">
                    <fieldset className="w-full gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4  lg:grid-cols-6">
                      {regions.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          className={`text-left border rounded px-2 lg:px-4 py-1 hover:border-slate-700 ${
                            selectedRegions.includes(r.id)
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
        <div className="space-y-6 divide-y divide-slate-200 pt-8 sm:space-y-5 sm:pt-10">
          <div>
            <h3 className="text-lg font-medium leading-6 text-slate-900">
              Interval
            </h3>
            <p className="mt-1  text-sm text-slate-500">
              How frequently should we call your API
            </p>
          </div>
          <div className="space-y-6 divide-y divide-slate-200 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
              <label
                htmlFor="last-name"
                className="block sm:col-span-2  text-sm font-medium text-slate-700 sm:mt-px sm:pt-2 pr-8"
              >
                Interval
              </label>
              <div className="mt-1  flex sm:col-span-4 sm:mt-0">
                <div className="group relative flex flex-grow items-stretch focus-within:z-10">
                  <input
                    type="number"
                    {...register("interval", {
                      valueAsNumber: true,
                      min: 1,
                    })}
                    defaultValue={15}
                    className="block w-full rounded-none rounded-l transition-all  group-focus:bg-slate-50 md:px-4 md:h-12  border-slate-900 border border-r-0 hover:bg-slate-50 duration-300 ease-in-out focus:outline-none "
                  />
                </div>
                <div className="relative -ml-px inline-flex items-center space-x-2 rounded-r border border-l-0 border-slate-900 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ">
                  <span>s</span>
                </div>
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
              <label
                htmlFor="distribution"
                className="block sm:col-span-2 text-sm font-medium text-slate-700 sm:mt-px sm:pt-2"
              >
                Distribution
                <p className="mt-1 text-sm font-normal text-slate-500">
                  Choose whether we should send a request from every selected
                  region at once, or only from one.
                </p>
              </label>
              <div className="mt-1 sm:col-span-4 sm:mt-0">
                <div className="">
                  <select
                    {...register("distribution", { required: true })}
                    className={"transition-all  focus:bg-slate-50 md:px-4 md:h-12 w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow"}
                    defaultValue="ALL"
                  >
                    <option value="RANDOM">Round Robin</option>
                    <option value="ALL">All</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6 divide-y divide-slate-200 pt-8 sm:space-y-5 sm:pt-10">
          <div>
            <h3 className="text-lg font-medium leading-6 text-slate-900">
              Summary
            </h3>
            <p className="mt-1  text-sm text-slate-500" />
          </div>
          <div className="space-y-6 divide-y divide-slate-200 sm:space-y-5">
            <div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
              <label
                htmlFor="last-name"
                className="sm:col-span-2 block text-sm font-medium text-slate-700 sm:mt-px sm:pt-2 pr-8"
              >
                Expected monthly requests
              </label>
              <div className="mt-1 flex sm:col-span-4 sm:mt-0">
                <div className=" cursor-not-allowed w-full rounded transition-all  md:px-4 md:h-12 inline-flex items-center  border-slate-900 border duration-300 ease-in-out focus:outline-none ">
                  {monthlyRequests.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end gap-8">
          <Link
            href={`/${teamSlug}/endpoints`}
            className="transition-all hover:cursor-pointer whitespace-nowrap md:px-4 py-2 font-medium inline-flex items-center justify-center md:border border-slate-900 rounded leading-snug duration-300 ease-in-out   text-slate-900 md:hover:bg-slate-50 hover:text-slate-900  shadow-sm group "
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit(submit)}
            className="transition-all hover:cursor-pointer whitespace-nowrap md:px-4 py-2 font-medium inline-flex items-center justify-center md:border border-slate-900 rounded leading-snug duration-300 ease-in-out md:bg-slate-900 md:text-slate-50 md:hover:bg-slate-50 hover:text-slate-900  shadow-sm group"
          >
            {loading ? <Loading /> : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
};
