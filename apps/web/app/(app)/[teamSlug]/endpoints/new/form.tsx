"use client";
import { Region } from "@planetfall/db";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { useRouter } from "next/navigation";
import * as assertions from "@planetfall/assertions";
import { trpc } from "lib/utils/trpc";
import { Minus } from "lucide-react";
import { Toaster, useToast } from "@/components/toast";
type Props = {
	teamId: string;
	teamSlug: string;
	regions: Region[];
	defaultTimeout: number;
};

type FormData = {
	name: string;
	url: string;
	method: "POST" | "GET" | "PUT" | "DELETE";
	headers?: string;
	body?: string;
	interval: number;
	distribution: "ALL" | "RANDOM";
	regions: string[];
	statusAssertions: z.infer<typeof assertions.statusAssertion>[];
	headerAssertions: z.infer<typeof assertions.headerAssertion>[];
	timeout: number;
	degradedAfter?: number;
};

export const Form: React.FC<Props> = ({
	teamSlug,
	teamId,
	regions,
	defaultTimeout,
}) => {
	const {
		register,
		formState: { errors },
		handleSubmit,
		setError,
		getValues,
		control,
		watch,
	} = useForm<FormData>({
		reValidateMode: "onSubmit",
		defaultValues: {
			timeout: defaultTimeout,
		},
	});

	const { addToast } = useToast();
	const router = useRouter();

	const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

	// const createEndpoint = trpc.endpoint.create.useMutation();

	const [loading, setLoading] = useState(false);
	const statusAssertions = useFieldArray({
		control,
		name: "statusAssertions",
	});
	const headerAssertions = useFieldArray({
		control,
		name: "headerAssertions",
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
			const res = trpc.endpoint.create.mutate({
				name: data.name,
				url: data.url,
				method: data.method,
				headers: data.headers ? JSON.parse(data.headers) : undefined,
				degradedAfter: data.degradedAfter
					? Number.isNaN(data.degradedAfter)
						? undefined
						: data.degradedAfter
					: undefined,
				timeout: data.timeout,
				interval: data.interval * 1000,
				regionIds: selectedRegions,
				distribution: data.distribution,
				teamId,
				statusAssertions: data.statusAssertions,
			});

			const { id } = await res;

			router.push(`/${teamSlug}/endpoints/${id}`);
		} catch (err) {
			console.error(err);
			addToast({
				title: "Error",
				content: (err as Error).message,
				variant: "error",
			});
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
		<form className="space-y-8 divide-y divide-zinc-200">
			<Toaster />
			<div className="space-y-8 sm:space-y-5 lg:space-y-24">
				<div className="space-y-6 sm:space-y-5">
					<div>
						<h3 className="text-lg font-medium leading-6 text-zinc-900">
							Name
						</h3>
						<p className="max-w-2xl mt-1 text-sm text-zinc-500">
							Enter a name to make it easier to find this endpoint later
						</p>
					</div>

					<div className="space-y-6 sm:space-y-5">
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="name"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
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
										className={`transition-all  focus:bg-zinc-50 md:px-4 md:h-12  w-full ${
											errors.url ? "border-red-500" : "border-zinc-700"
										} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
									/>
								</div>
								{errors.name ? (
									<p className="mt-2 text-sm text-red-500">
										{errors.name.message || "A Name is required"}
									</p>
								) : null}
							</div>
						</div>
					</div>
				</div>
				<div className="space-y-6 sm:space-y-5">
					<div>
						<h3 className="text-lg font-medium leading-6 text-zinc-900">URL</h3>
						<p className="mt-1 text-sm text-zinc-500">
							Enter the url of your endpoint and select a HTTP method
						</p>
					</div>

					<div className="space-y-6 sm:space-y-5">
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="method"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Method
							</label>
							<div className="mt-1 sm:col-span-4 sm:mt-0">
								<div className="">
									<select
										{...register("method", { required: true })}
										className={
											"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
										}
									>
										<option value="POST">POST</option>
										<option value="GET">GET</option>
										<option value="PUT">PUT</option>
										<option value="DELETE">DELETE</option>
									</select>
								</div>
							</div>
						</div>
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="url"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
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
										className={`transition-all  focus:bg-zinc-50 md:px-4 md:h-12  w-full ${
											errors.url ? "border-red-500" : "border-zinc-700"
										} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
									/>
								</div>
								{errors.url ? (
									<p className="mt-2 text-sm text-red-500">
										{errors.url.message || "A URL is required"}
									</p>
								) : null}
							</div>
						</div>
					</div>
				</div>

				<div className="pt-8 space-y-6 sm:space-y-5 sm:pt-10">
					<div>
						<h3 className="text-lg font-medium leading-6 text-zinc-900">
							Request
						</h3>
						<p className="max-w-2xl mt-1 text-sm text-zinc-500">
							Configure what is being sent to your API
						</p>
					</div>

					<div className="space-y-6 sm:space-y-5">
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="body"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Body
							</label>
							<div className="mt-1 sm:col-span-4 sm:mt-0">
								<textarea
									rows={3}
									disabled={!["POST", "PUT"].includes(formValues.method)}
									{...register("body")}
									className={`transition-all  focus:bg-zinc-50 md:px-4 px-2 py-1 md:py-3  w-full ${
										errors.body ? "border-red-500" : "border-zinc-700"
									} ${
										["POST", "PUT"].includes(formValues.method)
											? ""
											: "cursor-not-allowed"
									} hover:border-zinc-900 focus:border-zinc-900   border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
									defaultValue={""}
									placeholder={
										["POST", "PUT"].includes(formValues.method)
											? undefined
											: "Only available in POST or PUT requests"
									}
								/>
							</div>
						</div>

						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="last-name"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Headers
							</label>
							<div className="mt-1 sm:col-span-4 sm:mt-0">
								<textarea
									rows={3}
									{...register("headers", {
										validate: (v) => (v ? JSON.parse(v) : true),
									})}
									placeholder={`{\n  "Authorization": "Bearer XXX"\n}`}
									className={`transition-all  focus:bg-zinc-50 md:px-4 px-2 py-1 md:py-3  w-full ${
										errors.headers ? "border-red-500" : "border-zinc-700"
									} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
									defaultValue={""}
								/>
								{errors.headers ? (
									<p className="mt-2 text-sm text-red-500">
										{errors.headers.message || "Headers are invalid"}
									</p>
								) : null}
								<p className="mt-2 text-sm text-zinc-500">
									Headers can be configured using JSON notation
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="pt-8 space-y-6 sm:space-y-5 sm:pt-10">
					<div>
						<h3 className="text-lg font-medium leading-6 text-zinc-900">
							Acceptable Latency
						</h3>
						<p className="max-w-2xl mt-1 text-sm text-zinc-500">
							Configure the acceptable latency for this endpoint. If the latency
							exceeds the timeout, it will be marked as failed
						</p>
					</div>

					<div className="space-y-6 sm:space-y-5">
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="timeout"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Timeout
								<p className="text-xs font-normal">
									The request will be cancelled after this timeout
								</p>
							</label>
							<div className="mt-1 sm:col-span-4 sm:mt-0">
								<div className="flex mt-1 sm:col-span-2 sm:mt-0">
									<div className="relative flex items-stretch flex-grow group focus-within:z-10">
										<input
											type="number"
											{...register("timeout", {
												valueAsNumber: true,
												min: 1,
											})}
											min={1}
											className="block w-full px-4 py-3 transition-all duration-300 ease-in-out border border-r-0 rounded-none rounded-l group-focus:bg-zinc-50 border-zinc-900 hover:bg-zinc-50 focus:outline-none "
										/>
									</div>
									<div className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-l-0 rounded-r border-zinc-900 bg-zinc-50 text-zinc-700 ">
										<span>ms</span>
									</div>
								</div>
								{errors.timeout ? (
									<p className="mt-2 text-sm text-red-500">
										{errors.timeout.message || "Timeout is invalid"}
									</p>
								) : null}
							</div>
						</div>

						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="degradedAfter"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Degraded After
								<p className="text-xs font-normal">
									Set to 0 or empty to disable
								</p>
							</label>
							<div className="mt-1 sm:col-span-4 sm:mt-0">
								<div className="flex mt-1 sm:col-span-2 sm:mt-0">
									<div className="relative flex items-stretch flex-grow group focus-within:z-10">
										<input
											type="number"
											{...register("degradedAfter", {
												valueAsNumber: true,
												min: 0,
											})}
											min={0}
											className="block w-full px-4 py-3 transition-all duration-300 ease-in-out border border-r-0 rounded-none rounded-l group-focus:bg-zinc-50 border-zinc-900 hover:bg-zinc-50 focus:outline-none "
										/>
									</div>
									<div className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-l-0 rounded-r border-zinc-900 bg-zinc-50 text-zinc-700 ">
										<span>ms</span>
									</div>
								</div>
								{errors.degradedAfter ? (
									<p className="mt-2 text-sm text-red-500">
										{errors.degradedAfter.message || "degradedAfter is invalid"}
									</p>
								) : null}
							</div>
						</div>
					</div>
				</div>
				<div className="hidden sm:block" aria-hidden="true">
					<div className="py-5 md:py-8">
						<div className="border-t border-zinc-200" />
					</div>
				</div>

				<div className="pt-8 space-y-6 divide-y divide-zinc-200 sm:space-y-5 sm:pt-10">
					<div>
						<h3 className="text-lg font-medium leading-6 text-zinc-900">
							Assertions
						</h3>
						<p className="mt-1 text-sm text-zinc-500">
							Validate the response from your API. If any of the assertions
							fail, we will alert you.
						</p>
					</div>
					<div className="space-y-6 divide-y divide-zinc-200 sm:space-y-5">
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="status"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Status
							</label>
							<div className="mt-1 space-y-4 sm:col-span-4 sm:mt-0">
								{statusAssertions.fields.map((f, i) => (
									<div key={f.id} className="flex items-center gap-4">
										<select
											{...register(`statusAssertions.${i}.compare`, {
												required: true,
											})}
											className={
												"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
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
											{...register(`statusAssertions.${i}.target`, {
												required: true,
												valueAsNumber: true,
											})}
											className={
												"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
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
										Add Assertion
									</Button>
								</div>
							</div>
						</div>
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="header"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Header
							</label>
							<div className="mt-1 space-y-4 sm:col-span-4 sm:mt-0">
								{headerAssertions.fields.map((f, i) => (
									<div key={f.id} className="flex items-center gap-4">
										<input
											type="text"
											{...register(`headerAssertions.${i}.key`, {
												required: true,
											})}
											className={
												"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
											}
										/>
										<select
											{...register(`headerAssertions.${i}.compare`, {
												required: true,
											})}
											className={
												"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
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
											type="text"
											{...register(`headerAssertions.${i}.target`, {
												required: true,
											})}
											className={
												"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
											}
										/>
										<div>
											<Button
												type="button"
												onClick={() => headerAssertions.remove(i)}
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
										Add Assertion
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="pt-8 space-y-6 divide-y divide-zinc-200 sm:space-y-5 sm:pt-10">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-medium leading-6 text-zinc-900">
								Regions
							</h3>
							<p className="max-w-2xl mt-1 text-sm text-zinc-500">
								Select the regions from where we should call your API. We will
								either call your API from all regions in parallel, or one region
								at a time.
							</p>
						</div>
						<Button
							type="button"
							onClick={() => {
								if (selectedRegions.length >= regions.length / 2) {
									setSelectedRegions([]);
								} else {
									setSelectedRegions(regions.map((r) => r.id));
								}
							}}
						>
							{selectedRegions.length >= regions.length / 2
								? "Deselect all"
								: "Select all"}
						</Button>
					</div>
					<div className="space-y-6 divide-y divide-zinc-200 sm:space-y-5">
						<div className="pt-6 sm:pt-5">
							<div role="group" aria-labelledby="label-email">
								<div className="sm:grid sm:items-baseline sm:gap-4">
									<div className="mt-4 sm:col-span-3 sm:mt-0">
										<h4 className="w-full mt-8 mb-4 font-medium leading-6 text-center md:mb-8 md:mt-16 text-zinc-900">
											Vercel Edge Regions
										</h4>
										<fieldset className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
											{regions
												.filter((r) => r.platform === "vercelEdge")
												.map((r) => (
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
																setSelectedRegions(
																	selectedRegions.filter((id) => id !== r.id),
																);
															} else {
																setSelectedRegions([...selectedRegions, r.id]);
															}
														}}
													>
														<span className="px-2 py-1 lg:px-4">{r.name}</span>
													</button>
												))}
										</fieldset>
										<h4 className="w-full mt-8 mb-4 font-medium leading-6 text-center md:mb-8 md:mt-16 text-zinc-900">
											AWS Lambda Regions
										</h4>

										<fieldset className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
											{regions
												.filter((r) => r.platform === "aws")
												.map((r) => (
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
																setSelectedRegions(
																	selectedRegions.filter((id) => id !== r.id),
																);
															} else {
																setSelectedRegions([...selectedRegions, r.id]);
															}
														}}
													>
														<span className="px-2 py-1 lg:px-4">{r.name}</span>
													</button>
												))}
										</fieldset>
										{errors.regions ? (
											<p className="mt-2 text-sm text-red-500">
												{errors.regions.message || "Select at least one region"}
											</p>
										) : null}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="pt-8 space-y-6 divide-y divide-zinc-200 sm:space-y-5 sm:pt-10">
					<div>
						<h3 className="text-lg font-medium leading-6 text-zinc-900">
							Interval
						</h3>
						<p className="mt-1 text-sm text-zinc-500">
							How frequently should we call your API
						</p>
					</div>
					<div className="space-y-6 divide-y divide-zinc-200 sm:space-y-5">
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="last-name"
								className="block pr-8 text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Interval
							</label>
							<div className="flex mt-1 sm:col-span-4 sm:mt-0">
								<div className="relative flex items-stretch flex-grow group focus-within:z-10">
									<input
										type="number"
										{...register("interval", {
											valueAsNumber: true,
											min: 1,
										})}
										defaultValue={15}
										className="block w-full transition-all duration-300 ease-in-out border border-r-0 rounded-none rounded-l group-focus:bg-zinc-50 md:px-4 md:h-12 border-zinc-900 hover:bg-zinc-50 focus:outline-none"
									/>
								</div>
								<div className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-l-0 rounded-r border-zinc-900 bg-zinc-50 text-zinc-700 ">
									<span>s</span>
								</div>
							</div>
						</div>
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="distribution"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Distribution
								<p className="mt-1 text-sm font-normal text-zinc-500">
									Choose whether we should send a request from every selected
									region at once, or only from one.
								</p>
							</label>
							<div className="mt-1 sm:col-span-4 sm:mt-0">
								<div className="">
									<select
										{...register("distribution", { required: true })}
										className={
											"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
										}
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
				<div className="pt-8 space-y-6 divide-y divide-zinc-200 sm:space-y-5 sm:pt-10">
					<div>
						<h3 className="text-lg font-medium leading-6 text-zinc-900">
							Summary
						</h3>
						<p className="mt-1 text-sm text-zinc-500" />
					</div>
					<div className="space-y-6 divide-y divide-zinc-200 sm:space-y-5">
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="last-name"
								className="block pr-8 text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
							>
								Expected monthly requests
							</label>
							<div className="flex mt-1 sm:col-span-4 sm:mt-0">
								<div className="inline-flex items-center w-full transition-all duration-300 ease-in-out border rounded cursor-not-allowed md:px-4 md:h-12 border-zinc-900 focus:outline-none">
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
						className="inline-flex items-center justify-center py-2 font-medium leading-snug transition-all duration-300 ease-in-out rounded shadow-sm hover:cursor-pointer whitespace-nowrap md:px-4 md:border border-zinc-900 text-zinc-900 md:hover:bg-zinc-50 hover:text-zinc-900 group"
					>
						Cancel
					</Link>
					<button
						type="button"
						onClick={handleSubmit(submit)}
						className="inline-flex items-center justify-center py-2 font-medium leading-snug transition-all duration-300 ease-in-out rounded shadow-sm hover:cursor-pointer whitespace-nowrap md:px-4 md:border border-zinc-900 md:bg-zinc-900 md:text-zinc-50 md:hover:bg-zinc-50 hover:text-zinc-900 group"
					>
						{loading ? <Loading /> : "Create"}
					</button>
				</div>
			</div>
		</form>
	);
};
