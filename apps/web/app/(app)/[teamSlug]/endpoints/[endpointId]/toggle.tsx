"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";
import { trpc } from "lib/utils/trpc";
import { Switch } from "@/components/switch";
import Loading from "app/play/[shareId]/loading";

type Props = {
	endpointId: string;
	active: boolean;
};

export const Toggle: React.FC<Props> = ({ endpointId, active }) => {
	const router = useRouter();

	const [loading, setLoading] = useState(false)
	const [checked, setChecked] = useState(active)
	return (
		<div className="flex items-center">
			{loading ? <Loading /> : null}
			<Switch
				checked={checked}
				onClick={async () => {
					try {
						setLoading(true)
						const res = await trpc.endpoint.toggleActive.mutate({ endpointId });
						setChecked(res.active)
						router.refresh();
					} finally {
						setLoading(false)
					}
				}}
			/>
		</div>

	);
};

export default Toggle;
