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

	const vercelRegions = allRegions.filter((r) => r.platform === "vercelEdge");
	const awsRegions = allRegions.filter((r) => r.platform === "aws");

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
			<header className="fixed top-0 z-50 w-full backdrop-blur">
				<div className="container mx-auto px-4">
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
						<nav className="flex items-center grow justify-end">
							{/* <li className="hidden md:block">
										<Link
											className="flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-500 hover:text-zinc-700 lg:px-5"
											href="/docs"
										>
											Docs
										</Link>
									</li> */}
							<Link
								className="hidden md:flex items-center px-3 py-2 font-medium transition duration-150 ease-in-out text-zinc-500 hover:text-zinc-700 lg:px-5"
								href="/home"
							>
								Dashboard
							</Link>
							<Button key="submit" type="submit" variant="primary">
								{isLoading ? <Loading /> : "Check"}
							</Button>
						</nav>
					</div>
				</div>
			</header>
			<div className="container min-h-screen pb-20 mx-auto mt-24 -pt-24 px-4">
				<div className="pt-8 space-y-6  sm:space-y-5 sm:pt-10">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-medium leading-6 text-zinc-900">
								URL
							</h3>
							<p className="max-w-2xl mt-1 text-sm text-zinc-500">
								Enter the URL you want to check.
							</p>
						</div>
					</div>
					<div className="space-y-8 sm:space-y-5 lg:space-y-24 mt-8 lg:mt-16">
						<div className="flex items-center justify-start rounded border-zinc-900 border overflow-hidden group focus:border-zinc-900  hover:bg-zinc-50 duration-300 ease-in-out">
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
								type="text"
								{...register("url", {
									required: true,
									validate: (v) => z.string().url().safeParse(v).success,
								})}
								placeholder="https://example.com"
								className={`transition-all flex-grow focus:bg-zinc-50 md:px-4 md:h-12 focus:outline-none  group-hover:bg-zinc-50  w-full ${
									errors.url ? "border-red-500" : "border-zinc-700"
								}   focus:outline-none `}
							/>
						</div>
						{errors.url ? (
							<p className="mt-2 text-sm text-red-500">
								{errors.url.message || "A URL is required"}
							</p>
						) : null}
					</div>

					<div className="pt-8 space-y-6 sm:space-y-5 sm:pt-10">
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
						<div className="space-y-6 sm:space-y-5">
							<div role="group">
								<div className="sm:grid sm:items-baseline sm:gap-4">
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
										<div>
											<h4 className="w-full mt-8 mb-4 font-medium text-center leading-6 md:mb-8 md:mt-16 text-zinc-900">
												Vercel Edge
											</h4>
											<fieldset className="w-full grid grid-cols-1 gap-2 md:grid-cols-2 ">
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
																setSelectedRegions(
																	selectedRegions.filter((id) => id !== r.id),
																);
															} else {
																setSelectedRegions([...selectedRegions, r.id]);
															}
														}}
													>
														<span className="px-2 py-1 lg:px-4">
															{r.name.replace("@edge", "")}
														</span>
													</button>
												))}
											</fieldset>
										</div>

										<div className="h-full">
											<h4 className="w-full mt-8 mb-4 font-medium text-center leading-6 md:mb-8 md:mt-16 text-zinc-900">
												AWS Lambda
											</h4>

											{awsRegions.length > 0 ? (
												<fieldset className="w-full grid grid-cols-1 gap-2 md:grid-cols-2 ">
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
																	setSelectedRegions(
																		selectedRegions.filter((id) => id !== r.id),
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
											) : (
												<div className="flex justify-center w-full items-center p-8 lg:p-24 border border-zinc-300 rounded border-dashed ">
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
			</div>
		</form>
	);
};
