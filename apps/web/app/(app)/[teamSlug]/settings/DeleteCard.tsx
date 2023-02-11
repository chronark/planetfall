"use client";
import React, { useState } from "react";
import {
	Button,
	Card,
	Text,
	CardContent,
	CardFooter,
	CardHeader,
	CardFooterActions,
	CardHeaderTitle,
	Confirm,
} from "@/components/index";
import Link from "next/link";
import { UpgradeButton } from "./UpgradeButton";
import { PortalButton } from "./PortalButton";
import { createCollapsibleScope } from "@radix-ui/react-collapsible";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { MemberRole } from "@prisma/client";
import {
	DialogDescription,
	DialogHeader,
	Dialog,
	DialogContent,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "@/components/dialog";
import { Label } from "@/components/label";
import { useForm } from "react-hook-form";
import { trpc } from "@/lib/utils/trpc";
import { useRouter } from "next/navigation";
import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { Toaster, useToast } from "@/components/toast";

type Props = {
	teamSlug: string;
	teamId: string;
};

type FormData = {
	slug: string;
};
export const DeleteCard: React.FC<Props> = ({
	teamSlug,
	teamId,
}): JSX.Element => {
	const {
		register,
		formState: { errors },
		handleSubmit,
		setError,
		getValues,
		control,
		watch,
	} = useForm<{ slug: string }>({ reValidateMode: "onSubmit" });
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { addToast } = useToast();
	async function submit(data: FormData) {
		if (data.slug !== teamSlug) {
			setError("slug", { message: "Slug must match" });
			return;
		}
		setLoading(true);
		try {
			await trpc.team.deactivateTeam.mutate({ teamId });
			router.push("/home");
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
	return (
		<Card>
			<Toaster />
			<CardHeader>
				<CardHeaderTitle
					title="Delete Team"
					actions={[
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="danger">Delete Team</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										Are you sure you want to delete {teamSlug}?
									</DialogTitle>
									<DialogDescription className="px-4 py-2 font-medium text-red-600 bg-red-100 border border-red-500 rounded">
										This action cannot be undone. This will permanently delete
										your account and remove your data from our servers.
									</DialogDescription>

									<form
										onSubmit={handleSubmit(submit)}
										className="mt-4 md:mt-8"
									>
										<Text>
											Enter the team name{" "}
											<span className="font-semibold">{teamSlug}</span> to
											continue:
										</Text>
										<div className="mt-1 ">
											<Input
												type="text"
												{...register("slug", {
													required: true,
												})}
												placeholder={teamSlug}
											/>
											{errors.slug ? (
												<p className="mt-2 text-sm text-red-500">
													{errors.slug.message}
												</p>
											) : null}
										</div>

										<div className="flex justify-end w-full mt-4">
											<Button type="submit" variant="danger">
												{loading ? <Loading /> : "Delete Permanently"}
											</Button>
										</div>
									</form>
								</DialogHeader>
							</DialogContent>
						</Dialog>,
					]}
				/>
			</CardHeader>
		</Card>
	);
};
