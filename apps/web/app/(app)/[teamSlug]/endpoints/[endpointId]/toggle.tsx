"use client";
import { Button } from "@/components/button";
import React from "react";

import { useRouter } from "next/navigation";
import { trpc } from "lib/utils/trpc";

type Props = {
	endpointId: string;
	active: boolean;
};

export const Toggle: React.FC<Props> = ({ endpointId, active }) => {
	const router = useRouter();
	return (
		<div className="flex items-center">
			<div className="flex items-center justify-center w-6 h-6 mr-2">
				{active ? (
					<>
						<span className="absolute inline-flex w-4 h-4 rounded-full opacity-50 animate-ping-slow bg-emerald-400" />
						<span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
					</>
				) : (
					<span className="relative inline-flex w-2 h-2 rounded-full bg-amber-300" />
				)}
			</div>
			<Button
				onClick={async () => {
					await trpc.endpoint.toggleActive.mutate({ endpointId });
					router.refresh();
				}}
			>
				{active ? "Active" : "Disabled"}
			</Button>
		</div>
	);
};

export default Toggle;
