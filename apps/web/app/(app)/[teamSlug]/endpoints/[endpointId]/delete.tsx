"use client";
import { Button } from "@/components/button";
import { Confirm } from "@/components/confirm";
import { Endpoint } from "@planetfall/db";
import React from "react";

import { useRouter } from "next/navigation";
import { trpc } from "lib/utils/trpc";

type Props = {
	endpointId: string;
	endpointName?: string;
	endpointUrl: string;
};

export const DeleteButton: React.FC<Props> = ({
	endpointId,
	endpointName,
	endpointUrl,
}) => {
	const router = useRouter();
	return (
		<Confirm
			title="Delete endpoint?"
			description={endpointName ?? endpointUrl}
			trigger={<Button variant="danger">Delete</Button>}
			onConfirm={async () => {
				await trpc.endpoint.delete.mutate({ endpointId });
				router.refresh();
			}}
		/>
	);
};
