"use client";
import { Endpoint } from "@planetfall/db";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import Link from "next/link";
import { Loading } from "@/components/loading";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/utils/trpc";
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
			const res = await trpc.page.create.mutate({
				name: data.name,
				slug: data.slug.toLowerCase(),
				endpointIds: selectedEndpoints,
				teamId: teamId,
			});

			const url = `https://${res.slug}.planetfall.io`;
			router.push(url);
		} catch (err) {
			console.error(err);
			alert((err as Error).message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<form className="space-y-8 divide-y divide-zinc-200">
			<div className="space-y-8 sm:space-y-5 lg:space-y-24">
				<div className="space-y-6 sm:space-y-5">
					<div>
						<h3 className="text-lg font-medium leading-6 text-zinc-900">
							Name
						</h3>
						<p className="max-w-2xl mt-1 text-sm text-zinc-500">
							Enter a name and slug for your page. The slug will be used as
							subdomain: slug.planetfall.io
						</p>
					</div>

					<div className="space-y-6 sm:space-y-5">
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="url"
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
										placeholder="dub.sh"
										className={`transition-all  focus:bg-zinc-50 md:px-4 md:h-12  w-full ${
											errors.name ? "border-red-500" : "border-zinc-700"
										} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
									/>
								</div>
								{errors.name ? (
									<p className="mt-2 text-sm text-red-500">
										{errors.name.message || "A name is required"}
									</p>
								) : null}
							</div>
						</div>
						<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
							<label
								htmlFor="slug"
								className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
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
										className={`transition-all  focus:bg-zinc-50 md:px-4 md:h-12  w-full ${
											errors.name ? "border-red-500" : "border-zinc-700"
										} hover:border-zinc-900 focus:border-zinc-900  border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow`}
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

				<div className="pt-8 space-y-6 divide-y divide-zinc-200 sm:space-y-5 sm:pt-10">
					<div>
						<h3 className="text-lg font-medium leading-6 text-zinc-900">
							Endpoints
						</h3>
						<p className="max-w-2xl mt-1 text-sm text-zinc-500">
							Select the regions from where we should call your API. We will
							either call your API from all regions in parallel, or one region
							at a time.
						</p>
					</div>
					<div className="space-y-6 divide-y divide-zinc-200 sm:space-y-5">
						<div className="pt-6 sm:pt-5">
							<div role="group" aria-labelledby="label-email">
								<div className="sm:grid sm:items-baseline sm:gap-4">
									<div className="mt-4 sm:col-span-3 sm:mt-0">
										<fieldset className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
											{endpoints.map((e) => (
												<button
													type="button"
													key={e.id}
													className={`text-left border rounded flex flex-col px-2 lg:px-4 py-1 lg:py-2 hover:border-zinc-700 ${
														selectedEndpoints.includes(e.id)
															? "border-zinc-900 bg-zinc-50"
															: "border-zinc-300"
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
													<span className="font-medium text-zinc-700">
														{e.name}
													</span>
													<span className="text-zinc-500">{e.url}</span>
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
			</div>
		</form>
	);
};
