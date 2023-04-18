"use client";
import React, { useEffect, useReducer, useState } from "react";
import { PageHeader } from "@/components/page";
import { useFieldArray, useForm } from "react-hook-form";
import { Endpoint, Region } from "@planetfall/db";
import { Button } from "@/components/button";
import { trpc } from "lib/utils/trpc";
import { useToast } from "@/components/toast";
import { useRouter } from "next/navigation";
import * as Slider from "@radix-ui/react-slider";
import {
  assertion,
  deserialize as deserializeAssertions,
  HeaderAssertion,
  headerAssertion,
  statusAssertion,
} from "@planetfall/assertions";
import { z } from "zod";
import classNames from "classnames";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { AwsLambda } from "@/components/icons/AwsLambda";
import { VercelEdge } from "@/components/icons/VercelEdge";
import { Fly } from "@/components/icons/Fly";
type Props = {
  teamSlug: string;
  endpoint: Omit<Endpoint, "createdAt" | "updatedAt"> & { regions: Region[] };
  regions: Region[];
};

export const Form: React.FC<Props> = ({ regions, teamSlug, endpoint }) => {
  const { addToast } = useToast();
  const [selectedRegions, setSelectedRegions] = useState(endpoint.regions);
  const router = useRouter();

  const nameForm = useForm<{ name: string }>();
  const urlForm = useForm<{
    url: string;
    method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
  }>();
  const redirectForm = useForm<{
    followRedirects: "true" | "false";
  }>();
  const requestForm = useForm<{ body: string; headers: string }>();
  const latencyForm = useForm<{
    timeout: number;
    degradedAfter: number;
  }>();

  const intervalForm = useForm<{
    interval: number;
    distribution: "ALL" | "RANDOM";
  }>();

  const assertions = endpoint.assertions
    ? deserializeAssertions(endpoint.assertions).map((a) => a.schema)
    : [];

  const statusAssertionsForm = useForm<{
    assertions: z.infer<typeof statusAssertion>[];
  }>({
    defaultValues: {
      assertions: assertions.filter((a) => a.type === "status") as any,
    },
  });

  const statusAssertions = useFieldArray({
    control: statusAssertionsForm.control,
    name: "assertions",
  });

  const headerAssertionsForm = useForm<{
    assertions: z.infer<typeof headerAssertion>[];
  }>({
    defaultValues: {
      assertions: assertions.filter((a) => a.type === "header") as any,
    },
  });

  const headerAssertions = useFieldArray({
    control: headerAssertionsForm.control,
    name: "assertions",
  });

  const [loading, setLoading] = useState<Record<string, boolean>>({});

  return (
    <>
      <PageHeader
        sticky={true}
        title="Endpoint Settings"
        description={endpoint.name}
        actions={[
          <Link key="cancel" href={`/${teamSlug}/endpoints/${endpoint.id}`}>
            <Button>Go Back</Button>
          </Link>,
        ]}
      />

      <div className="container mx-auto">
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-zinc-900">General</h3>
                <p className="mt-1 text-sm text-zinc-600" />
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form>
                <div className="border sm:overflow-hidden sm:rounded">
                  <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                    <div className="">
                      <label
                        htmlFor="company-website"
                        className="block text-sm font-medium text-zinc-700"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        {...nameForm.register("name", {
                          required: true,
                        })}
                        defaultValue={endpoint.name}
                        placeholder="My API"
                        className={`w-full transition-all  focus:bg-zinc-50 px-4 py-3  ${
                          nameForm.formState.errors.name ? "border-red-500" : "border-zinc-300"
                        } hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:border`}
                      />

                      {nameForm.formState.errors.name ? (
                        <p className="mt-2 text-sm text-red-500">
                          {nameForm.formState.errors.name.message || "A Name is required"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
                    <Button
                      isLoading={loading.name}
                      onClick={nameForm.handleSubmit(async ({ name }) => {
                        setLoading({ ...loading, name: true });
                        await trpc.endpoint.update
                          .mutate({
                            endpointId: endpoint.id,
                            name,
                          })
                          .then(() => {
                            addToast({ title: "Name updated" });
                            router.refresh();
                          })
                          .catch((err) => {
                            addToast({
                              title: "Error",

                              content: (err as Error).message,
                            });
                          });
                        setLoading({ ...loading, name: false });
                      })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5 md:py-8">
            <div className="border-t border-zinc-200" />
          </div>
        </div>

        <div className="mt-10 sm:mt-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-zinc-900">URL</h3>
                <p className="mt-1 text-sm text-zinc-600">Change the URL or HTTP method.</p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form>
                <div className="border sm:overflow-hidden sm:rounded">
                  <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                    <div className="">
                      <label
                        htmlFor="company-website"
                        className="block text-sm font-medium text-zinc-700"
                      >
                        Method
                      </label>
                      <select
                        {...urlForm.register("method", { required: true })}
                        className="w-full px-4 py-3 transition-all duration-300 ease-in-out border rounded focus:bg-zinc-50 border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:shadow"
                        defaultValue={endpoint.method}
                      >
                        <option value="POST">POST</option>
                        <option value="GET">GET</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>

                      {urlForm.formState.errors.method ? (
                        <p className="mt-2 text-sm text-red-500">
                          {urlForm.formState.errors.method.message || "A Method is required"}
                        </p>
                      ) : null}
                    </div>

                    <div className="">
                      <label
                        htmlFor="company-website"
                        className="block text-sm font-medium text-zinc-700"
                      >
                        Url
                      </label>
                      <input
                        type="text"
                        {...urlForm.register("url", {
                          required: true,
                        })}
                        defaultValue={endpoint.url}
                        className={`w-full transition-all  focus:bg-zinc-50 px-4 py-3  ${
                          urlForm.formState.errors.url ? "border-red-500" : "border-zinc-300"
                        } hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:border`}
                      />

                      {urlForm.formState.errors.url ? (
                        <p className="mt-2 text-sm text-red-500">
                          {urlForm.formState.errors.url.message || "A URL is required"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
                    <Button
                      isLoading={loading.url}
                      onClick={urlForm.handleSubmit(async ({ url, method }) => {
                        setLoading({ ...loading, url: true });
                        await trpc.endpoint.update
                          .mutate({
                            endpointId: endpoint.id,
                            url,
                            method,
                          })
                          .then(() => {
                            addToast({ title: "Endpoint updated" });
                            router.refresh();
                          })
                          .catch((err) => {
                            addToast({
                              variant: "error",
                              title: "Error",
                              content: (err as Error).message,
                            });
                          });
                        setLoading({ ...loading, url: false });
                      })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5 md:py-8">
            <div className="border-t border-zinc-200" />
          </div>
        </div>
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-zinc-900">Follow Redirects</h3>

                <p className="mt-1 text-sm text-zinc-600">
                  Whether we should follow redirects. If followed the latency of all of the
                  individual requests adds up.
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form>
                <div className="border sm:overflow-hidden sm:rounded">
                  <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                    <div className="">
                      <label
                        htmlFor="company-website"
                        className="block text-sm font-medium text-zinc-700"
                      >
                        Follow Redirects
                      </label>
                      <select
                        {...redirectForm.register("followRedirects")}
                        defaultValue={endpoint.followRedirects ? "true" : "false"}
                        className="w-full px-4 py-3 transition-all duration-300 ease-in-out border rounded focus:bg-zinc-50 border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:shadow"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>

                      {redirectForm.formState.errors.followRedirects ? (
                        <p className="mt-2 text-sm text-red-500">
                          {redirectForm.formState.errors.followRedirects.message || "Invalid"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
                    <Button
                      isLoading={loading.redirect}
                      onClick={redirectForm.handleSubmit(async ({ followRedirects }) => {
                        setLoading({ ...loading, redirect: true });
                        await trpc.endpoint.update
                          .mutate({
                            endpointId: endpoint.id,
                            followRedirects: followRedirects === "true",
                          })
                          .then(() => {
                            router.refresh();
                            addToast({ title: "Endpoint updated" });
                          })
                          .catch((err) => {
                            addToast({
                              variant: "error",
                              title: "Error",
                              content: (err as Error).message,
                            });
                          });
                        setLoading({ ...loading, redirect: false });
                      })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5 md:py-8">
            <div className="border-t border-zinc-200" />
          </div>
        </div>
        <div className="mt-10 sm:mt-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-zinc-900">Request</h3>
                <p className="mt-1 text-sm text-zinc-600">Change the request body and headers.</p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form>
                <div className="border sm:overflow-hidden sm:rounded">
                  <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                    <div className="">
                      <label
                        htmlFor="company-website"
                        className="block text-sm font-medium text-zinc-700"
                      >
                        Headers
                      </label>
                      <textarea
                        {...requestForm.register("headers")}
                        rows={5}
                        defaultValue={
                          endpoint.headers ? JSON.stringify(endpoint.headers, null, 2) : undefined
                        }
                        className={`font-mono w-full transition-all  focus:bg-zinc-50 px-4 py-3  ${
                          requestForm.formState.errors.headers
                            ? "border-red-500"
                            : "border-zinc-300"
                        } hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:border`}
                      />

                      {requestForm.formState.errors.headers ? (
                        <p className="mt-2 text-sm text-red-500">
                          {requestForm.formState.errors.headers.message || "Invalid headers"}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-zinc-500">
                        Headers can be configured using JSON notation
                      </p>
                    </div>

                    <div className="">
                      <label
                        htmlFor="company-website"
                        className="block text-sm font-medium text-zinc-700"
                      >
                        Body
                      </label>
                      <textarea
                        {...requestForm.register("body")}
                        rows={5}
                        defaultValue={endpoint.body ?? undefined}
                        className={`font-mono w-full transition-all  focus:bg-zinc-50 px-4 py-3  ${
                          requestForm.formState.errors.body ? "border-red-500" : "border-zinc-300"
                        } hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:border`}
                      />

                      {requestForm.formState.errors.body ? (
                        <p className="mt-2 text-sm text-red-500">
                          {requestForm.formState.errors.body.message || "The body is invalid"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
                    <Button
                      isLoading={loading.headers}
                      onClick={requestForm.handleSubmit(async ({ headers, body }) => {
                        setLoading({ ...loading, headers: true });
                        await trpc.endpoint.update
                          .mutate({
                            endpointId: endpoint.id,

                            headers: headers ? JSON.parse(headers) : undefined,
                            body: typeof body === "string" && body === "" ? null : body,
                          })
                          .then(() => {
                            router.refresh();
                            addToast({ title: "Endpoint updated" });
                          })
                          .catch((err) => {
                            addToast({
                              variant: "error",
                              title: "Error",
                              content: (err as Error).message,
                            });
                          });
                        setLoading({ ...loading, headers: false });
                      })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5 md:py-8">
            <div className="border-t border-zinc-200" />
          </div>
        </div>
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-zinc-900">Acceptable Latency</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Configure the acceptable latency for this endpoint. If the latency exceeds the
                  timeout, it will be marked as failed
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form>
                <div className="border sm:overflow-hidden sm:rounded">
                  <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                    <div className="">
                      <label htmlFor="timeout" className="block text-sm font-medium text-zinc-700">
                        Timeout
                      </label>

                      <div className="flex mt-1 sm:col-span-2 sm:mt-0">
                        <div className="relative flex items-stretch flex-grow group focus-within:z-10">
                          <input
                            type="number"
                            {...latencyForm.register("timeout", {
                              valueAsNumber: true,
                              min: 0,
                            })}
                            min={0}
                            defaultValue={endpoint.timeout ?? undefined}
                            className="block w-full px-4 py-3 transition-all duration-300 ease-in-out border border-r-0 rounded-none rounded-l group-focus:bg-zinc-50 border-zinc-900 hover:bg-zinc-50 focus:outline-none "
                          />
                        </div>
                        <div className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-l-0 rounded-r border-zinc-900 bg-zinc-50 text-zinc-700 ">
                          <span>ms</span>
                        </div>
                      </div>

                      {latencyForm.formState.errors.timeout ? (
                        <p className="mt-2 text-sm text-red-500">
                          {latencyForm.formState.errors.timeout.message || "Timeout is invalid"}
                        </p>
                      ) : null}
                    </div>
                    <div className="">
                      <label htmlFor="timeout" className="block text-sm font-medium text-zinc-700">
                        Degraded After
                      </label>

                      <div className="flex mt-1 sm:col-span-2 sm:mt-0">
                        <div className="relative flex items-stretch flex-grow group focus-within:z-10">
                          <input
                            type="number"
                            {...latencyForm.register("degradedAfter", {
                              valueAsNumber: true,
                              min: 0,
                            })}
                            min={0}
                            defaultValue={endpoint.degradedAfter ?? undefined}
                            className="block w-full px-4 py-3 transition-all duration-300 ease-in-out border border-r-0 rounded-none rounded-l group-focus:bg-zinc-50 border-zinc-900 hover:bg-zinc-50 focus:outline-none "
                          />
                        </div>
                        <div className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-l-0 rounded-r border-zinc-900 bg-zinc-50 text-zinc-700 ">
                          <span>ms</span>
                        </div>
                      </div>

                      {latencyForm.formState.errors.degradedAfter ? (
                        <p className="mt-2 text-sm text-red-500">
                          {latencyForm.formState.errors.degradedAfter.message ||
                            "DegradedAfter is invalid"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
                    <Button
                      isLoading={loading.latency}
                      onClick={latencyForm.handleSubmit(async ({ timeout, degradedAfter }) => {
                        setLoading({ ...loading, latency: true });
                        await trpc.endpoint.update
                          .mutate({
                            endpointId: endpoint.id,
                            timeout,
                            degradedAfter,
                          })
                          .then(() => {
                            router.refresh();
                            addToast({ title: "Endpoint updated" });
                          })
                          .catch((err) => {
                            addToast({
                              variant: "error",
                              title: "Error",
                              content: (err as Error).message,
                            });
                          });
                        setLoading({ ...loading, latency: false });
                      })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5 md:py-8">
            <div className="border-t border-zinc-200" />
          </div>
        </div>
        <div className="mt-10 sm:mt-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-zinc-900">Assertions</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Validate the response. If at least one assertion fails, we will alert you.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-10 md:col-span-2 md:mt-0">
              <form>
                <div className="border sm:overflow-hidden sm:rounded">
                  <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                    <label className="block text-sm font-medium text-zinc-700">Status</label>
                    {statusAssertions.fields.map((f, i) => (
                      <div key={f.id} className="flex items-center gap-4">
                        <select
                          {...statusAssertionsForm.register(`assertions.${i}.compare`, {
                            required: true,
                          })}
                          className={
                            "transition-all  focus:bg-zinc-50 py-3 px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                          }
                        >
                          <option value="gt">Greater than</option>
                          <option value="gte">Greater than or equal</option>
                          <option value="lt">Less than</option>
                          <option value="lte">Less than or equal</option>
                          <option value="eq">Equal</option>
                          <option value="not_eq">Not Equal</option>
                        </select>
                        <input
                          type="number"
                          {...statusAssertionsForm.register(`assertions.${i}.target`, {
                            required: true,
                            valueAsNumber: true,
                          })}
                          className={
                            "transition-all  focus:bg-zinc-50 py-3 px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                          }
                        />
                        <div>
                          <Button
                            type="button"
                            onClick={() => statusAssertions.remove(i)}
                            size="lg"
                          >
                            <Minus className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="w-full">
                      <Button
                        type="button"
                        onClick={() =>
                          statusAssertions.append({
                            version: "v1",
                            type: "status",
                            compare: "eq",
                            target: 200,
                          })
                        }
                        size="lg"
                      >
                        <Plus className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
                    <Button
                      isLoading={loading.status}
                      onClick={nameForm.handleSubmit(async ({ name }) => {
                        setLoading({ ...loading, status: true });
                        await trpc.endpoint.update
                          .mutate({
                            endpointId: endpoint.id,
                            statusAssertions: statusAssertionsForm.getValues().assertions,
                          })
                          .then(() => {
                            addToast({ title: "Assertions updated" });
                            router.refresh();
                          })
                          .catch((err) => {
                            addToast({
                              variant: "error",
                              title: "Error",
                              content: (err as Error).message,
                            });
                          });
                        setLoading({ ...loading, status: false });
                      })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
              <form>
                <div className="border sm:overflow-hidden sm:rounded">
                  <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                    <label className="block text-sm font-medium text-zinc-700">Headers</label>
                    {headerAssertions.fields.map((f, i) => (
                      <div key={f.id} className="flex items-center gap-4">
                        <input
                          {...headerAssertionsForm.register(`assertions.${i}.key`, {
                            required: true,
                          })}
                          className={
                            "transition-all font-mono focus:bg-zinc-50 py-3 px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                          }
                        />
                        <select
                          {...headerAssertionsForm.register(`assertions.${i}.compare`, {
                            required: true,
                          })}
                          className={
                            "transition-all  focus:bg-zinc-50 py-3 px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                          }
                        >
                          <option value="gt">Greater than</option>
                          <option value="gte">Greater than or equal</option>
                          <option value="lt">Less than</option>
                          <option value="lte">Less than or equal</option>
                          <option value="eq">Equal</option>
                          <option value="not_eq">Not Equal</option>
                        </select>
                        <input
                          {...headerAssertionsForm.register(`assertions.${i}.target`, {
                            required: true,
                          })}
                          className={
                            "transition-all font-mono  focus:bg-zinc-50 py-3 px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
                          }
                        />
                        <div>
                          <Button onClick={() => headerAssertions.remove(i)} size="lg">
                            <Minus className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="w-full">
                      <Button
                        type="button"
                        onClick={() =>
                          headerAssertions.append({
                            version: "v1",
                            type: "header",
                            key: "Content-Type",
                            compare: "eq",
                            target: "application/json",
                          })
                        }
                        size="lg"
                      >
                        <Plus className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
                    <Button
                      isLoading={loading.header}
                      onClick={headerAssertionsForm.handleSubmit(async () => {
                        setLoading({ ...loading, header: true });
                        await trpc.endpoint.update
                          .mutate({
                            endpointId: endpoint.id,
                            headerAssertions: headerAssertionsForm.getValues().assertions,
                          })
                          .then(() => {
                            addToast({ title: "Assertions updated" });
                            router.refresh();
                          })
                          .catch((err) => {
                            addToast({
                              variant: "error",
                              title: "Error",
                              content: (err as Error).message,
                            });
                          });
                        setLoading({ ...loading, header: false });
                      })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5 md:py-8">
            <div className="border-t border-zinc-200" />
          </div>
        </div>
        <div className="mt-10 sm:mt-0">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-zinc-900">Regions</h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Select the regions where checks will run
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form>
                <div className="border sm:overflow-hidden sm:rounded">
                  <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                    <div className="">
                      <fieldset className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {regions.map((r) => (
                          <button
                            type="button"
                            key={r.id}
                            className={`flex items-center justify-between border rounded px-2 lg:px-4 py-1 hover:border-zinc-700 ${
                              selectedRegions.find((region) => region.id === r.id)
                                ? "border-zinc-900 bg-zinc-50"
                                : "border-zinc-300"
                            }`}
                            onClick={() => {
                              if (selectedRegions.find((region) => region.id === r.id)) {
                                setSelectedRegions(
                                  selectedRegions.filter((region) => region.id !== r.id),
                                );
                              } else {
                                setSelectedRegions([...selectedRegions, r]);
                              }
                            }}
                          >
                            {r.name}
                            {r.platform === "aws" ? (
                              <AwsLambda className="w-4 h-4" />
                            ) : r.platform === "vercelEdge" ? (
                              <VercelEdge className="w-4 h-4" />
                            ) : r.platform === "fly" ? (
                              <Fly className="w-4 h-4" />
                            ) : null}
                          </button>
                        ))}
                      </fieldset>

                      {selectedRegions.length === 0 ? (
                        <p className="mt-2 text-sm text-red-500">Select at least 1 region</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
                    <Button
                      type="button"
                      isLoading={loading.regions}
                      onClick={async () => {
                        setLoading({ ...loading, regions: true });
                        await trpc.endpoint.update
                          .mutate({
                            endpointId: endpoint.id,
                            regionIds: selectedRegions.map((r) => r.id),
                          })
                          .then(() => {
                            router.refresh();
                            addToast({ title: "Endpoint updated" });
                          })
                          .catch((err) => {
                            addToast({
                              variant: "error",
                              title: "Error",
                              content: (err as Error).message,
                            });
                          });
                        setLoading({ ...loading, regions: false });
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden sm:block" aria-hidden="true">
          <div className="py-5 md:py-8">
            <div className="border-t border-zinc-200" />
          </div>
        </div>
        <div>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-zinc-900">Interval</h3>
                <p className="mt-1 text-sm text-zinc-600" />
              </div>
            </div>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <form>
                <div className="border sm:overflow-hidden sm:rounded">
                  <div className="px-4 py-5 space-y-6 bg-white sm:p-6">
                    <div className="">
                      <label
                        htmlFor="company-website"
                        className="block text-sm font-medium text-zinc-700"
                      >
                        Interval
                      </label>

                      <div className="flex mt-1 sm:col-span-2 sm:mt-0">
                        <div className="relative flex items-stretch flex-grow group focus-within:z-10">
                          <input
                            type="number"
                            {...intervalForm.register("interval", {
                              valueAsNumber: true,
                              min: 1,
                            })}
                            defaultValue={endpoint.interval / 1000}
                            className="block w-full px-4 py-3 transition-all duration-300 ease-in-out border border-r-0 rounded-none rounded-l group-focus:bg-zinc-50 border-zinc-900 hover:bg-zinc-50 focus:outline-none "
                          />
                        </div>
                        <div className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-l-0 rounded-r border-zinc-900 bg-zinc-50 text-zinc-700 ">
                          <span>s</span>
                        </div>
                      </div>

                      {intervalForm.formState.errors.interval ? (
                        <p className="mt-2 text-sm text-red-500">
                          {intervalForm.formState.errors.interval.message || "Interval is invalid"}
                        </p>
                      ) : null}
                    </div>
                    <div className="">
                      <label
                        htmlFor="company-website"
                        className="block text-sm font-medium text-zinc-700"
                      >
                        Distribution
                      </label>
                      <select
                        {...intervalForm.register("distribution")}
                        defaultValue={endpoint.distribution}
                        className="w-full px-4 py-3 transition-all duration-300 ease-in-out border rounded focus:bg-zinc-50 border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:shadow"
                      >
                        <option value="ALL">All</option>
                        <option value="RANDOM">Round Robin</option>
                      </select>

                      {intervalForm.formState.errors.distribution ? (
                        <p className="mt-2 text-sm text-red-500">
                          {intervalForm.formState.errors.distribution.message || "Invalid"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
                    <Button
                      isLoading={loading.interval}
                      onClick={intervalForm.handleSubmit(async ({ interval, distribution }) => {
                        setLoading({ ...loading, interval: true });
                        await trpc.endpoint.update
                          .mutate({
                            endpointId: endpoint.id,
                            interval: interval ? interval * 1000 : undefined,
                            distribution,
                          })
                          .then(() => {
                            router.refresh();
                            addToast({ title: "Endpoint updated" });
                          })
                          .catch((err) => {
                            addToast({
                              variant: "error",
                              title: "Error",
                              content: (err as Error).message,
                            });
                          });
                        setLoading({ ...loading, interval: false });
                      })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
