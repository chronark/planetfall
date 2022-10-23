import { Layout } from "components/app/layout/nav";
import { Fragment, useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@planetfall/svc/web/lib/hooks/trpc";
import { useRouter } from "next/router";
import { useSession, useUser } from "components/auth";
import { Heading } from "@planetfall/svc/web/components/heading";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Button } from "components";
import {
  Alert,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  notification,
  Radio,
  Row,
  Select,
  Slider,
  Space,
  Steps,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  InformationCircleIcon,
  MinusIcon,
  MinusSmallIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import { Option } from "antd/lib/mentions";
import TextArea from "antd/lib/input/TextArea";
import { PageHeader } from "@planetfall/svc/web/components";
import { useFieldArray, useForm } from "react-hook-form";
import { request } from "node:http";

type RequiredMark = boolean | "optional";

export default function Page() {
  useSession();
  const router = useRouter();
  const teamSlug = router.query.teamSlug as string;
  const endpointId = router.query.endpointId as string;

  const endpoint = trpc.endpoint.get.useQuery({ endpointId }, {
    enabled: !!endpointId,
  });


  const breadcrumbs = [
    {
      label: endpoint.data?.name ?? endpoint.data?.url ?? endpointId,
      href: `/${teamSlug}/endpoints/${endpointId}`,
    },
    {
      label: "Settings",
      href: `/${teamSlug}/endpoints/${endpointId}/settings`,
    },
  ];
  const ctx = trpc.useContext();
  const updateEndpoint = trpc.endpoint.update.useMutation({
    onSettled: () => {
      ctx.endpoint.get.invalidate({ endpointId });
      ctx.endpoint.list.invalidate();
    },
  });
  const regions = trpc.region.list.useQuery();

  const [selectedRegions, setSelectedRegions] = useState(
    endpoint.data?.regions ? endpoint.data.regions : [],
  );
  useEffect(() => {
    if (endpoint.data) {
      setSelectedRegions(endpoint.data.regions);
    }
  }, [endpoint.data]);

  const nameForm = useForm<{ name: string }>();
  const urlForm = useForm<
    { url: string; method: "POST" | "GET" | "PUT" | "DELETE" }
  >();
  const requestForm = useForm<{ body: string; headers: string }>();
  const intervalForm = useForm<
    { interval: number; distribution: "ALL" | "RANDOM" }
  >();

  const statusAssertionsForm = useForm<{
    assertions: {
      comparison: "gt" | "lt" | "eq" | "lte" | "gte";
      target: number;
    }[];
  }>();

  const statusAssertions = useFieldArray({
    control: statusAssertionsForm.control,
    name: "assertions",
  });

  // useEffect(()=>{
  //   if (endpoint.data){
  //     for(const a of assertions.deserialize)
  //   }
  // },[endpoint.data])

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <PageHeader
        title="Endpoint Settings"
        description="Edit your endpoint's settings"
        actions={[
          <Button
            key="cancel"
            href={`/${teamSlug}/endpoints/${endpointId}`}
          >
            Cancel
          </Button>,
        ]}
      />

      <div>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                General
              </h3>
              <p className="mt-1 text-sm text-slate-600">
              </p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form>
              <div className="border sm:overflow-hidden sm:rounded">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="company-website"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      {...nameForm.register("name", {
                        required: true,
                      })}
                      defaultValue={endpoint.data?.name ?? ""}
                      placeholder="My API"
                      className={`w-full transition-all  focus:bg-slate-50 md:px-4 md:py-3  ${
                        nameForm.formState.errors.name
                          ? "border-red-500"
                          : "border-slate-300"
                      } hover:border-slate-900 focus:border-slate-900  border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:border`}
                    />

                    {nameForm.formState.errors.name
                      ? (
                        <p className="mt-2 text-sm text-red-500">
                          {nameForm.formState.errors.name.message ||
                            "A Name is required"}
                        </p>
                      )
                      : null}
                  </div>
                </div>
                <div className="border-t border-slate-200 px-4 py-3 text-right sm:px-6">
                  <Button
                    type="secondary"
                    onClick={nameForm.handleSubmit(async ({ name }) => {
                      await updateEndpoint.mutateAsync({
                        endpointId,
                        teamSlug,
                        name,
                      })
                        .then(() =>
                          notification.success({ message: `Name updated` })
                        )
                        .catch((err) => {
                          notification.error({
                            message: (err as Error).message,
                          });
                        });
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
          <div className="border-t border-slate-200" />
        </div>
      </div>

      <div className=" sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                URL
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Change the URL or HTTP method.
              </p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form>
              <div className="border sm:overflow-hidden sm:rounded">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="company-website"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Method
                    </label>
                    <select
                      {...urlForm.register("method", { required: true })}
                      className={`transition-all  focus:bg-slate-50 md:px-4 md:py-3 w-full border-slate-300 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
                    >
                      <option value="POST">POST</option>
                      <option value="GET">GET</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>

                    {urlForm.formState.errors.method
                      ? (
                        <p className="mt-2 text-sm text-red-500">
                          {urlForm.formState.errors.method.message ||
                            "A Method is required"}
                        </p>
                      )
                      : null}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="company-website"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Url
                    </label>
                    <input
                      type="text"
                      {...urlForm.register("url", {
                        required: true,
                      })}
                      defaultValue={endpoint.data?.url ?? ""}
                      className={`w-full transition-all  focus:bg-slate-50 md:px-4 md:py-3  ${
                        urlForm.formState.errors.url
                          ? "border-red-500"
                          : "border-slate-300"
                      } hover:border-slate-900 focus:border-slate-900  border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:border`}
                    />

                    {urlForm.formState.errors.url
                      ? (
                        <p className="mt-2 text-sm text-red-500">
                          {urlForm.formState.errors.url.message ||
                            "A URL is required"}
                        </p>
                      )
                      : null}
                  </div>
                </div>
                <div className="border-t border-slate-200 px-4 py-3 text-right sm:px-6">
                  <Button
                    type="secondary"
                    onClick={urlForm.handleSubmit(async ({ url, method }) => {
                      await updateEndpoint.mutateAsync({
                        endpointId,
                        teamSlug,
                        url,
                        method,
                      })
                        .then(() =>
                          notification.success({ message: `Endpoint updated` })
                        )
                        .catch((err) => {
                          notification.error({
                            message: (err as Error).message,
                          });
                        });
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
          <div className="border-t border-slate-200" />
        </div>
      </div>
      <div className=" sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                Request
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Change the request body and headers.
              </p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form>
              <div className="border sm:overflow-hidden sm:rounded">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="company-website"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Headers
                    </label>
                    <textarea
                      {...requestForm.register("headers")}
                      rows={5}
                      defaultValue={endpoint.data?.headers
                        ? JSON.stringify(endpoint.data.headers, null, 2)
                        : undefined}
                      className={`font-mono w-full transition-all  focus:bg-slate-50 md:px-4 md:py-3  ${
                        requestForm.formState.errors.headers
                          ? "border-red-500"
                          : "border-slate-300"
                      } hover:border-slate-900 focus:border-slate-900  border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:border`}
                    />

                    {requestForm.formState.errors.headers
                      ? (
                        <p className="mt-2 text-sm text-red-500">
                          {requestForm.formState.errors.headers.message ||
                            "Invalid headers"}
                        </p>
                      )
                      : null}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="company-website"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Body
                    </label>
                    <textarea
                      {...requestForm.register("body")}
                      rows={5}
                      defaultValue={endpoint.data?.body ?? undefined}
                      className={`font-mono w-full transition-all  focus:bg-slate-50 md:px-4 md:py-3  ${
                        requestForm.formState.errors.body
                          ? "border-red-500"
                          : "border-slate-300"
                      } hover:border-slate-900 focus:border-slate-900  border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:border`}
                    />

                    {requestForm.formState.errors.body
                      ? (
                        <p className="mt-2 text-sm text-red-500">
                          {requestForm.formState.errors.body.message ||
                            "The body is invalid"}
                        </p>
                      )
                      : null}
                  </div>
                </div>
                <div className="border-t border-slate-200 px-4 py-3 text-right sm:px-6">
                  <Button
                    type="secondary"
                    onClick={requestForm.handleSubmit(
                      async ({ headers, body }) => {
                        await updateEndpoint.mutateAsync({
                          endpointId,
                          teamSlug,
                          headers: headers ? JSON.parse(headers) : undefined,
                          body: typeof body === "string" && body === ""
                            ? null
                            : body,
                        }).then(() =>
                          notification.success({ message: `Endpoint updated` })
                        )
                          .catch((err) => {
                            notification.error({
                              message: (err as Error).message,
                            });
                          });
                      },
                    )}
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
          <div className="border-t border-slate-200" />
        </div>
      </div>
      <div className=" sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                Assertions
              </h3>
              {/* <p className="mt-1 text-sm text-slate-600">Change the request body and headers.</p> */}
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form>
              <div className="border sm:overflow-hidden sm:rounded">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="company-website"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Status Code
                    </label>
                    <div className="mt-1 sm:col-span-4 sm:mt-0 space-y-4">
                      {statusAssertions.fields.map((f, i) => (
                        <div key={f.id} className="flex items-center gap-4">
                          <select
                            {...statusAssertionsForm.register(
                              `assertions.${i}.comparison`,
                              {
                                required: true,
                              },
                            )}
                            className={`transition-all  focus:bg-slate-50 md:px-4 md:h-12 w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
                          >
                            <option value="gte">Greater than or equal</option>
                            <option value="lte">Less than or equal</option>
                            <option value="eq">Equal</option>
                          </select>
                          <input
                            type="number"
                            {...statusAssertionsForm.register(
                              `assertions.${i}.target`,
                              {
                                required: true,
                                valueAsNumber: true,
                              },
                            )}
                            className={`transition-all  focus:bg-slate-50 md:px-4 md:h-12 w-full border-slate-900 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
                          >
                          </input>
                          <div>
                            <Button
                              type="secondary"
                              square
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
                          block
                          icon={<PlusIcon className="w-6 h-6" />}
                        />
                      </div>
                    </div>

                    {urlForm.formState.errors.url
                      ? (
                        <p className="mt-2 text-sm text-red-500">
                          {urlForm.formState.errors.url.message ||
                            "A URL is required"}
                        </p>
                      )
                      : null}
                  </div>
                </div>
                <div className="border-t border-slate-200 px-4 py-3 text-right sm:px-6">
                  <Button
                    type="secondary"
                    onClick={urlForm.handleSubmit(async ({ url, method }) => {
                      await updateEndpoint.mutateAsync({
                        endpointId,
                        teamSlug,
                        url,
                        method,
                      })
                        .then(() =>
                          notification.success({ message: `Endpoint updated` })
                        )
                        .catch((err) => {
                          notification.error({
                            message: (err as Error).message,
                          });
                        });
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
          <div className="border-t border-slate-200" />
        </div>
      </div>
      <div className=" sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                Regions
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Select the regions where checks will run
              </p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form>
              <div className="border sm:overflow-hidden sm:rounded">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="space-y-2">
                    <fieldset className="w-full gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  lg:grid-cols-4">
                      {regions.data?.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          className={`text-left border rounded px-2 lg:px-4 py-1 hover:border-slate-700 ${
                            selectedRegions.find((region) => region.id === r.id)
                              ? "border-slate-900 bg-slate-50"
                              : "border-slate-300"
                          }`}
                          onClick={() => {
                            if (
                              selectedRegions.find((region) =>
                                region.id === r.id
                              )
                            ) {
                              setSelectedRegions(
                                selectedRegions.filter((region) =>
                                  region.id !== r.id
                                ),
                              );
                            } else {
                              setSelectedRegions([...selectedRegions, r]);
                            }
                          }}
                        >
                          {r.name}
                        </button>
                      ))}
                    </fieldset>

                    {selectedRegions.length === 0
                      ? (
                        <p className="mt-2 text-sm text-red-500">
                          Select at least 1 region
                        </p>
                      )
                      : null}
                  </div>
                </div>
                <div className="border-t border-slate-200 px-4 py-3 text-right sm:px-6">
                  <Button
                    type="secondary"
                    onClick={async () => {
                      await updateEndpoint.mutateAsync({
                        endpointId,
                        teamSlug,
                        regionIds: selectedRegions.map((r) => r.id),
                      }).then(() =>
                        notification.success({ message: `Endpoint updated` })
                      )
                        .catch((err) => {
                          notification.error({
                            message: (err as Error).message,
                          });
                        });
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
          <div className="border-t border-slate-200" />
        </div>
      </div>
      <div>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-slate-900">
                Interval
              </h3>
              <p className="mt-1 text-sm text-slate-600">
              </p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <form>
              <div className="border sm:overflow-hidden sm:rounded">
                <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="company-website"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Interval
                    </label>
                    <div className="flex sm:col-span-2 sm:mt-0">
                      <div className="group relative flex flex-grow items-stretch focus-within:z-10">
                        <input
                          type="number"
                          {...intervalForm.register("interval", {
                            valueAsNumber: true,
                            min: 1,
                          })}
                          defaultValue={endpoint.data
                            ? endpoint.data?.interval / 1000
                            : undefined}
                          className="block w-full rounded-none rounded-l transition-all  group-focus:bg-slate-50 md:px-4 md:py-3  border-slate-900 border border-r-0 hover:bg-slate-50 duration-300 ease-in-out focus:outline-none "
                        />
                      </div>
                      <div className="relative -ml-px inline-flex items-center space-x-2 rounded-r border border-l-0 border-slate-900 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 ">
                        <span>s</span>
                      </div>
                    </div>

                    {intervalForm.formState.errors.interval
                      ? (
                        <p className="mt-2 text-sm text-red-500">
                          {intervalForm.formState.errors.interval.message ||
                            "Interval is invalid"}
                        </p>
                      )
                      : null}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="company-website"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Distribution
                    </label>
                    <select
                      {...intervalForm.register("distribution")}
                      defaultValue={endpoint.data?.distribution}
                      className={`transition-all  focus:bg-slate-50 md:px-4 md:py-3 w-full border-slate-300 border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
                    >
                      <option value="ALL">All</option>
                      <option value="RANDOM">Round Robin</option>
                    </select>

                    {intervalForm.formState.errors.distribution
                      ? (
                        <p className="mt-2 text-sm text-red-500">
                          {intervalForm.formState.errors.distribution.message ||
                            "Invalid"}
                        </p>
                      )
                      : null}
                  </div>
                </div>
                <div className="border-t border-slate-200 px-4 py-3 text-right sm:px-6">
                  <Button
                    type="secondary"
                    onClick={intervalForm.handleSubmit(
                      async ({ interval, distribution }) => {
                        await updateEndpoint.mutateAsync({
                          endpointId,
                          teamSlug,
                          interval: interval ? interval * 1000 : undefined,
                          distribution,
                        }).then(() =>
                          notification.success({ message: `Endpoint updated` })
                        )
                          .catch((err) => {
                            notification.error({
                              message: (err as Error).message,
                            });
                          });
                      },
                    )}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
