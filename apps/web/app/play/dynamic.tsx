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
import { Logo } from "@/components/logo";
import { trpc } from "lib/utils/trpc";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { ToastProvider, useToast } from "@/components/toast";

type FormData = {
	url: string;
	method: string;
	regions: string[];
	repeat: string;
};

type Props = {
	regions: Region[];
	defaultValues: Partial<FormData>;
};

export const Form: React.FC<Props> = (props): JSX.Element => {
	return (
		<ToastProvider>
			<Inner {...props} />
		</ToastProvider>
	);
};

export const Inner: React.FC<Props> = ({
	defaultValues,
	regions: allRegions,
}): JSX.Element => {
	const {
		register,
		formState: { errors },
		handleSubmit,
		setError,
		setValue,
	} = useForm<FormData>({ reValidateMode: "onSubmit", defaultValues });

	const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();
	const { addToast } = useToast();

	async function submit(data: FormData) {
		if (selectedRegions.length === 0) {
			setError("regions", { message: "Select at least 1 region" });
		}
		setIsLoading(true);
		await trpc.play.check
			.mutate({
				url: data.url,
				method: data.method as any,
				regionIds: selectedRegions,
				repeat: data.repeat === "true",
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
		<>
			{/* <Dialog.Root
				open={!!shareUrl}
				onOpenChange={() => {
					setShareUrl(null);
				}}
			>
				<Transition.Root show={!!shareUrl}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Dialog.Overlay
							forceMount={true}
							className="fixed inset-0 z-20 bg-zinc-900/50"
						/>
					</Transition.Child>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<Dialog.Content
							forceMount={true}
							className={classNames(
								"fixed z-50",
								"w-[95vw] max-w-md rounded p-4 md:w-full",
								"top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
								"bg-white dark:bg-zinc-800",
								"focus:outline-none focus-visible:ring focus-visible:ring-zinc-500 focus-visible:ring-opacity-75",
							)}
						>
							<Dialog.Title>
								<Heading h3={true}>Do you want to share these results?</Heading>
							</Dialog.Title>
							<Dialog.Description className="p-4">
								<Link
									href={shareUrl ?? ""}
									className="flex justify-center px-2 py-1 rounded hover:bg-zinc-50 bg-zinc-100 text-zinc-700 ring-1 ring-zinc-900"
								>
									{shareUrl}
								</Link>
							</Dialog.Description>

							<div className="flex justify-end pt-4 border-t space-x-2 border-zinc-200 ">
								<Dialog.Cancel>
									<Button type="secondary">Close</Button>
								</Dialog.Cancel>
							</div>
						</Dialog.Content>
					</Transition.Child>
				</Transition.Root>
			</Dialog.Root> */}
			<form onSubmit={handleSubmit(submit)}>
				<header className="fixed top-0 z-50 w-full backdrop-blur">
					<div className="container mx-auto">
						<div className="flex items-center justify-between h-16 md:h-20">
							{/* Site branding */}
							<div className="mr-4 shrink-0">
								{/* Logo */}
								<Link href="/" aria-label="Planetfall">
									<div className="flex items-center gap-2 group ">
										<Logo className="w-10 h-10 duration-500 group-hover:text-zinc-700 text-zinc-900" />
										<span className="text-2xl font-semibold duration-500 group-hover:text-black text-zinc-900">
											Planetfall
										</span>
									</div>
								</Link>
							</div>
							{/* Desktop navigation */}
							<nav className="flex items-center grow">
								<ul className="flex flex-wrap items-center justify-end gap-8 grow">
									{/* <li className="hidden md:block">
										<Link
											className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-500 hover:text-zinc-700 lg:px-5"
											href="/docs"
										>
											Docs
										</Link>
									</li> */}
									<li className="hidden md:block">
										<Link
											className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-500 hover:text-zinc-700 lg:px-5"
											href="/home"
										>
											Dashboard
										</Link>
									</li>
									<li>
										<button
											key="submit"
											type="submit"
											disabled={isLoading}
											className="inline-flex items-center justify-center py-2 font-medium leading-snug rounded transition-all duration-300 ease-in-out shadow-sm hover:cursor-pointer whitespace-nowrap md:px-4 md:border border-zinc-900 md:bg-zinc-900 md:text-zinc-50 md:hover:bg-zinc-50 hover:text-zinc-900 group"
										>
											{isLoading ? <Loading /> : "Check"}
										</button>
									</li>
								</ul>
							</nav>
						</div>
					</div>
				</header>
				<div className="container min-h-screen pb-20 mx-auto mt-24 -pt-24">
					<div>
						<PageHeader
							title="Planetfall Playground"
							description="Enter a URL, method and up to five regions to check the latency of your API"
						/>
						<div className="space-y-8 sm:space-y-5 lg:space-y-24">
							<div className="space-y-6 sm:space-y-5">
								<div>
									<h3 className="text-lg font-medium leading-6 text-zinc-900">
										URL
									</h3>
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
													<option value="GET">GET</option>
													<option value="POST">POST</option>
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
														validate: (v) =>
															z.string().url().safeParse(v).success,
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

							<div className="space-y-6 sm:space-y-5">
								<div>
									<h3 className="text-lg font-medium leading-6 text-zinc-900">
										Repeat
									</h3>
									<p className="mt-1 text-sm text-zinc-500">
										Send 2 requests to your API in rapid succession to simulate
										cold and hot functions or caches.
									</p>
								</div>

								<div className="space-y-6 sm:space-y-5">
									<div className="sm:grid sm:grid-cols-6 sm:items-start sm:gap-4 sm:border-t sm:border-zinc-200 sm:pt-5">
										<label
											htmlFor="repeat"
											className="block text-sm font-medium sm:col-span-2 text-zinc-700 sm:mt-px sm:pt-2"
										>
											Repeat
										</label>
										<div className="mt-1 sm:col-span-4 sm:mt-0">
											<div className="">
												<select
													{...register("repeat", { required: false })}
													className={
														"transition-all  focus:bg-zinc-50 md:px-4 md:h-12 w-full border-zinc-900 border rounded hover:bg-zinc-50 duration-300 ease-in-out focus:outline-none focus:shadow"
													}
												>
													<option value="false">No</option>
													<option value="true">Yes</option>
												</select>
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
										{selectedRegions.length >= allRegions.length / 2
											? "Deselect all"
											: "Select all"}
									</Button>
								</div>
								<div className="space-y-6 divide-y divide-zinc-200 sm:space-y-5">
									<div className="pt-6 sm:pt-5">
										<div role="group">
											<div className="sm:grid sm:items-baseline sm:gap-4">
												<div className="mt-4 sm:col-span-3 sm:mt-0">
													<h4 className="w-full mt-8 mb-4 font-medium text-center leading-6 md:mb-8 md:mt-16 text-zinc-900">
														Vercel Edge Regions
													</h4>
													<fieldset className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
														{allRegions
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
																				selectedRegions.filter(
																					(id) => id !== r.id,
																				),
																			);
																		} else {
																			setSelectedRegions([
																				...selectedRegions,
																				r.id,
																			]);
																		}
																	}}
																>
																	<span className="px-2 py-1 lg:px-4">
																		{r.name}
																	</span>
																</button>
															))}
													</fieldset>
													<h4 className="w-full mt-8 mb-4 font-medium text-center leading-6 md:mb-8 md:mt-16 text-zinc-900">
														AWS Lambda Regions
													</h4>

													<fieldset className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
														{allRegions
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
																				selectedRegions.filter(
																					(id) => id !== r.id,
																				),
																			);
																		} else {
																			setSelectedRegions([
																				...selectedRegions,
																				r.id,
																			]);
																		}
																	}}
																>
																	<span className="px-2 py-1 lg:px-4">
																		{r.name}
																	</span>
																</button>
															))}
													</fieldset>
													{errors.regions ? (
														<p className="mt-2 text-sm text-red-500">
															{errors.regions.message ||
																"Select at least one region"}
														</p>
													) : null}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</form>
		</>
	);
};
