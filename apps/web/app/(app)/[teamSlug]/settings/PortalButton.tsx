"use client";
import { Button } from "@/components/button";
import { Loading } from "@/components/loading";
import { trpc } from "lib/utils/trpc";
import { useState } from "react";

type Props = {
	teamId: string;
};

export const PortalButton: React.FC<Props> = (props): JSX.Element => {
	const [loading, setLoading] = useState(false);
	return (
		<Button
			onClick={async () => {
				try {
					setLoading(true);
					const res = await trpc.billing.portal.query({
						teamId: props.teamId,
					});
					if (res.url) {
						/**
						 * router.push was causing cors errors
						 */
						window.location.href = res.url;
					}
				} catch (err) {
					alert((err as Error).message);
				} finally {
					setLoading(false);
				}
			}}
			disabled={!loading}
		>
			{loading ? <Loading /> : "Manage your Subscription"}
		</Button>
	);
};
