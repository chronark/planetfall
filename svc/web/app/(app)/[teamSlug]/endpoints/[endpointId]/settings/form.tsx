"use client";
import React, { useState } from "react";
import { PageHeader } from "@/components/page";
import { useForm } from "react-hook-form";
import { Endpoint, Region } from "@planetfall/db";
import { Button } from "@/components/button";
import { trpc } from "lib/utils/trpc";
import { ToastProvider, useToaster } from "@/components/toast";
import { useRouter } from "next/navigation";

type Props = {
	teamSlug: string;
	endpoint: Omit<Endpoint, "createdAt" | "updatedAt"> & { regions: Region[] };
	regions: Region[];
};

export const Form: React.FC<Props> = ({ regions, teamSlug, endpoint }) => {
	return (
		<ToastProvider>
			<Inner regions={regions} teamSlug={teamSlug} endpoint={endpoint} />
		</ToastProvider>
	);
};

export const Inner: React.FC<Props> = ({ regions, teamSlug, endpoint }) => {
	const { addToast } = useToaster();
	const [selectedRegions, setSelectedRegions] = useState(endpoint.regions);
	const router = useRouter();

	const nameForm = useForm<{ name: string }>();
	const urlForm = useForm<{
		url: string;
		method: "POST" | "GET" | "PUT" | "DELETE";
	}>();
	const requestForm = useForm<{ body: string; headers: string }>();
	const intervalForm = useForm<{
		interval: number;
		distribution: "ALL" | "RANDOM";
	}>();

	return (
		<>
			<PageHeader
				title="Endpoint Settings"
				description="Edit your endpoint's settings"
				actions={[
					<Button key="cancel" href={`/${teamSlug}/endpoints/${endpoint.id}`}>
						Cancel
					</Button>,
				]}
			/>

			<div className="container mx-auto">
				<div>
					{" "}
					<div className="md:grid md:grid-cols-3 md:gap-6">
						<div className="md:col-span-1">
							<div className="px-4 sm:px-0">
								<h3 className="text-lg font-medium leading-6 text-zinc-900">
									General
								</h3>
								<p className="mt-1 text-sm text-zinc-600"></p>
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
												className={`w-full transition-all  focus:bg-zinc-50 md:px-4 md:py-3  ${
													nameForm.formState.errors.name
														? "border-red-500"
														: "border-zinc-300"
												} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:border`}
											/>

											{nameForm.formState.errors.name ? (
												<p className="mt-2 text-sm text-red-500">
													{nameForm.formState.errors.name.message ||
														"A Name is required"}
												</p>
											) : null}
										</div>
									</div>
									<div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
										<Button
											type="secondary"
											onClick={nameForm.handleSubmit(async ({ name }) => {
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
															type: "error",
															title: "Error",
															content: (err as Error).message,
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
						<div className="border-t border-zinc-200" />
					</div>
				</div>

				<div className="mt-10 sm:mt-0">
					<div className="md:grid md:grid-cols-3 md:gap-6">
						<div className="md:col-span-1">
							<div className="px-4 sm:px-0">
								<h3 className="text-lg font-medium leading-6 text-zinc-900">
									URL
								</h3>
								<p className="mt-1 text-sm text-zinc-600">
									Change the URL or HTTP method.
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
												Method
											</label>
											<select
												{...urlForm.register("method", { required: true })}
												className="w-full transition-all duration-300 ease-in-out border rounded focus:bg-zinc-50 md:px-4 md:py-3 border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:shadow"
												defaultValue={endpoint.method}
											>
												<option value="POST">POST</option>
												<option value="GET">GET</option>
												<option value="PUT">PUT</option>
												<option value="DELETE">DELETE</option>
											</select>

											{urlForm.formState.errors.method ? (
												<p className="mt-2 text-sm text-red-500">
													{urlForm.formState.errors.method.message ||
														"A Method is required"}
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
												className={`w-full transition-all  focus:bg-zinc-50 md:px-4 md:py-3  ${
													urlForm.formState.errors.url
														? "border-red-500"
														: "border-zinc-300"
												} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:border`}
											/>

											{urlForm.formState.errors.url ? (
												<p className="mt-2 text-sm text-red-500">
													{urlForm.formState.errors.url.message ||
														"A URL is required"}
												</p>
											) : null}
										</div>
									</div>
									<div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
										<Button
											type="secondary"
											onClick={urlForm.handleSubmit(async ({ url, method }) => {
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
															type: "error",
															title: "Error",
															content: (err as Error).message,
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
						<div className="border-t border-zinc-200" />
					</div>
				</div>
				<div className="mt-10 sm:mt-0">
					<div className="md:grid md:grid-cols-3 md:gap-6">
						<div className="md:col-span-1">
							<div className="px-4 sm:px-0">
								<h3 className="text-lg font-medium leading-6 text-zinc-900">
									Request
								</h3>
								<p className="mt-1 text-sm text-zinc-600">
									Change the request body and headers.
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
												Headers
											</label>
											<textarea
												{...requestForm.register("headers")}
												rows={5}
												defaultValue={
													endpoint.headers
														? JSON.stringify(endpoint.headers, null, 2)
														: undefined
												}
												className={`font-mono w-full transition-all  focus:bg-zinc-50 md:px-4 md:py-3  ${
													requestForm.formState.errors.headers
														? "border-red-500"
														: "border-zinc-300"
												} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:border`}
											/>

											{requestForm.formState.errors.headers ? (
												<p className="mt-2 text-sm text-red-500">
													{requestForm.formState.errors.headers.message ||
														"Invalid headers"}
												</p>
											) : null}
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
												className={`font-mono w-full transition-all  focus:bg-zinc-50 md:px-4 md:py-3  ${
													requestForm.formState.errors.body
														? "border-red-500"
														: "border-zinc-300"
												} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:border`}
											/>

											{requestForm.formState.errors.body ? (
												<p className="mt-2 text-sm text-red-500">
													{requestForm.formState.errors.body.message ||
														"The body is invalid"}
												</p>
											) : null}
										</div>
									</div>
									<div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
										<Button
											type="secondary"
											onClick={requestForm.handleSubmit(
												async ({ headers, body }) => {
													await trpc.endpoint.update
														.mutate({
															endpointId: endpoint.id,

															headers: headers
																? JSON.parse(headers)
																: undefined,
															body:
																typeof body === "string" && body === ""
																	? null
																	: body,
														})
														.then(() => {
															router.refresh();
															addToast({ title: "Endpoint updated" });
														})
														.catch((err) => {
															addToast({
																type: "error",
																title: "Error",
																content: (err as Error).message,
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
						<div className="border-t border-zinc-200" />
					</div>
				</div>
				<div className="mt-10 sm:mt-0">
					<div className="md:grid md:grid-cols-3 md:gap-6">
						<div className="md:col-span-1">
							<div className="px-4 sm:px-0">
								<h3 className="text-lg font-medium leading-6 text-zinc-900">
									Assertions
								</h3>
								{/* <p className="mt-1 text-sm text-zinc-600">Change the request body and headers.</p> */}
							</div>
						</div>
						<div className="mt-5 md:col-span-2 md:mt-0">
							<form>
								<div className="px-4 py-4 border sm:overflow-hidden sm:rounded">
									Coming soon
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
								<h3 className="text-lg font-medium leading-6 text-zinc-900">
									Regions
								</h3>
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
														className={`text-left border rounded px-2 lg:px-4 py-1 hover:border-zinc-700 ${
															selectedRegions.find(
																(region) => region.id === r.id,
															)
																? "border-zinc-900 bg-zinc-50"
																: "border-zinc-300"
														}`}
														onClick={() => {
															if (
																selectedRegions.find(
																	(region) => region.id === r.id,
																)
															) {
																setSelectedRegions(
																	selectedRegions.filter(
																		(region) => region.id !== r.id,
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

											{selectedRegions.length === 0 ? (
												<p className="mt-2 text-sm text-red-500">
													Select at least 1 region
												</p>
											) : null}
										</div>
									</div>
									<div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
										<Button
											type="secondary"
											onClick={async () => {
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
															type: "error",
															title: "Error",
															content: (err as Error).message,
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
						<div className="border-t border-zinc-200" />
					</div>
				</div>
				<div>
					<div className="md:grid md:grid-cols-3 md:gap-6">
						<div className="md:col-span-1">
							<div className="px-4 sm:px-0">
								<h3 className="text-lg font-medium leading-6 text-zinc-900">
									Interval
								</h3>
								<p className="mt-1 text-sm text-zinc-600"></p>
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
														className="block w-full transition-all duration-300 ease-in-out border border-r-0 rounded-none rounded-l group-focus:bg-zinc-50 md:px-4 md:py-3 border-zinc-900 hover:bg-zinc-50 focus:outline-none "
													/>
												</div>
												<div className="relative inline-flex items-center px-4 py-2 -ml-px space-x-2 text-sm font-medium border border-l-0 rounded-r border-zinc-900 bg-zinc-50 text-zinc-700 ">
													<span>s</span>
												</div>
											</div>

											{intervalForm.formState.errors.interval ? (
												<p className="mt-2 text-sm text-red-500">
													{intervalForm.formState.errors.interval.message ||
														"Interval is invalid"}
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
												className="w-full transition-all duration-300 ease-in-out border rounded focus:bg-zinc-50 md:px-4 md:py-3 border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:shadow"
											>
												<option value="ALL">All</option>
												<option value="RANDOM">Round Robin</option>
											</select>

											{intervalForm.formState.errors.distribution ? (
												<p className="mt-2 text-sm text-red-500">
													{intervalForm.formState.errors.distribution.message ||
														"Invalid"}
												</p>
											) : null}
										</div>
									</div>
									<div className="px-4 py-3 text-right border-t border-zinc-200 sm:px-6">
										<Button
											type="secondary"
											onClick={intervalForm.handleSubmit(
												async ({ interval, distribution }) => {
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
																type: "error",
																title: "Error",
																content: (err as Error).message,
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
			</div>
		</>
	);
};
