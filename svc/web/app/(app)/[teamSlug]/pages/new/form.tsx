"use client";
import { Endpoint, Region } from "@planetfall/db";
import React, { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import Link from "next/link";
import { z } from "zod";
import { MinusSmallIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { useRouter } from "next/navigation";
import type { Input as Req, Output as Res } from "pages/api/v1/pages";
import { mutate } from "lib/api/call";
type Props = {
	teamId: string;
	teamSlug: string;
	endpoints: Endpoint[];
};

type FormData = {
	name: string;
	slug: string;
	endpointIds: string[];
};

export const Form: React.FC<Props> = ({ teamSlug, teamId, endpoints }) => {
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

	const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);

	const [loading, setLoading] = useState(false);

	async function submit(data: FormData) {
		if (selectedEndpoints.length === 0) {
			setError("endpointIds", { message: "Select at least 1 endpoint" });
		}
		setLoading(true);
		try {
			const res = await mutate<Req["body"], Res>("/api/v1/pages", {
				name: data.name,
				slug: data.slug.toLowerCase(),
				endpointIds: selectedEndpoints,
				teamId: teamId,
			});

			if (res.error) {
				console.error(res.error);
				throw new Error(res.error.message);
			}

			const url = `https://${data.slug.toLowerCase()}.planetfall.io`;
			router.push(url);
		} catch (err) {
			console.error(err);
			alert((err as Error).message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<form className="space-y-8 divide-y divide-slate-200">
			<div className="space-y-8  sm:space-y-5 lg:space-y-24">
				<div className="space-y-6 sm:space-y-5">
					<div>
						<h3 className="text-lg font-medium leading-6 text-slate-900">
							Name
						</h3>
						<p className="mt-1 max-w-2xl text-sm text-slate-500">
							Enter a name and slug for your page. The slug will be used as
							subdomain: slug.planetfall.io
						</p>
					</div>

					<div className="space-y-6 sm:space-y-5">
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
							<label
								htmlFor="url"
								className="block sm:col-span-2 text-sm font-medium text-slate-700 sm:mt-px sm:pt-2"
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
										placeholder="dub.sh"
										className={`transition-all  focus:bg-slate-50 md:px-4 md:h-12  w-full ${
											errors.name ? "border-red-500" : "border-slate-700"
										} hover:border-slate-900 focus:border-slate-900  border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
									/>
								</div>
								{errors.name ? (
									<p className="mt-2 text-sm text-red-500">
										{errors.name.message || "A name is required"}
									</p>
								) : null}
							</div>
						</div>
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-slate-200 sm:pt-5">
							<label
								htmlFor="slug"
								className="block sm:col-span-2 text-sm font-medium text-slate-700 sm:mt-px sm:pt-2"
							>
								Slug
							</label>
							<div className="mt-1 sm:col-span-4 sm:mt-0">
								<div className="">
									<input
										type="text"
										{...register("slug", {
											required: true,
											validate: (value) =>
												new RegExp(/^[a-z0-9-_]+$/).test(value),
										})}
										placeholder="dub"
										className={`transition-all  focus:bg-slate-50 md:px-4 md:h-12  w-full ${
											errors.name ? "border-red-500" : "border-slate-700"
										} hover:border-slate-900 focus:border-slate-900  border rounded hover:bg-slate-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
									/>
								</div>
								{errors.name ? (
									<p className="mt-2 text-sm text-red-500">
										{errors.name.message || "A name is required"}
									</p>
								) : null}
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-6 divide-y divide-slate-200 pt-8 sm:space-y-5 sm:pt-10">
					<div>
						<h3 className="text-lg font-medium leading-6 text-slate-900">
							Endpoints
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
										<fieldset className="w-full gap-4 grid grid-cols-1 sm:grid-cols-2">
											{endpoints.map((e) => (
												<button
													type="button"
													key={e.id}
													className={`text-left border rounded flex flex-col px-2 lg:px-4 py-1 lg:py-2 hover:border-slate-700 ${
														selectedEndpoints.includes(e.id)
															? "border-slate-900 bg-slate-50"
															: "border-slate-300"
													}`}
													onClick={() => {
														if (selectedEndpoints.includes(e.id)) {
															setSelectedEndpoints(
																selectedEndpoints.filter((id) => id !== e.id),
															);
														} else {
															setSelectedEndpoints([
																...selectedEndpoints,
																e.id,
															]);
														}
													}}
												>
													<span className="font-medium text-slate-700">
														{e.name}
													</span>
													<span className="text-slate-500">{e.url}</span>
												</button>
											))}
										</fieldset>
										{errors.endpointIds ? (
											<p className="mt-2 text-sm text-red-500">
												{errors.endpointIds.message ||
													"Select at least one endpoint"}
											</p>
										) : null}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="pt-5">
					<div className="flex justify-end gap-8">
						<Link
							href={`/${teamSlug}/pages`}
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
			</div>
		</form>
	);
};
