"use client";
import React from "react";
import {
	Button,
	Card,
	Text,
	CardContent,
	CardFooter,
	CardHeader,
	CardFooterActions,
	CardHeaderTitle,
} from "@/components/index";
import Link from "next/link";
import { UpgradeButton } from "./UpgradeButton";
import { PortalButton } from "./PortalButton";

type Props = {
	team: {
		id: string;
		plan: string;
		isPersonal: boolean;
		maxMonthlyRequests: number;
	};
	usage: number;
	usagePercentage: number;
	year: number;
	month: number;
};

export const BillingCard: React.FC<Props> = ({
	usagePercentage,
	team,
	usage,
	year,
	month,
}): JSX.Element => {
	return (
		<Card>
			<CardHeader>
				<CardHeaderTitle
					title="Billing"
					subtitle={
						<Text>
							You are currently on the{" "}
							<span className="px-1 border rounded border-zinc-300 bg-zinc-50">
								{team.plan}
							</span>{" "}
							plan.
						</Text>
					}
				/>
			</CardHeader>

			{/* actions={[
                  <Button
                    type="primary"
                    loading={checkout.isLoading}
                    key={"pro"}
                    disabled={!team}
                    onClick={handleCheckout}
                  >
                    {team?.stripeTrialExpires || team?.plan === "PERSONAL"
                      ? "Upgrade to PRO"
                      : "Change Plan"}
                  </Button>,
                ]} */}
			<CardContent>
				<div className="flex justify-around py-4 divide-x divide-zinc-200">
					<div className="flex flex-col w-1/3 gap-2 px-8">
						<Text size="xl">Current Usage</Text>
						<Text>
							{usage.toLocaleString()} /{" "}
							{team.maxMonthlyRequests?.toLocaleString() ?? "∞"}{" "}
							{usagePercentage !== null
								? `(${usagePercentage.toLocaleString(undefined, {
										maximumFractionDigits: 2,
								  })}%)`
								: null}
						</Text>
						{usagePercentage !== null ? (
							<div className="overflow-hidden bg-zinc-200 rounded-full">
								<div
									className="h-2 rounded bg-primary-600"
									style={{ width: `${usagePercentage}%` }}
								/>
							</div>
						) : null}
					</div>

					<div className="flex flex-col w-1/3 gap-2 px-8">
						<Text size="xl">Cost</Text>
						<Text>
							$
							{Math.max(0, (usage - 100000) * 0.0001).toLocaleString(
								undefined,
								{ maximumFractionDigits: 2 },
							)}
						</Text>
					</div>
					<div className="flex flex-col w-1/3 gap-2 px-8">
						<Text size="xl">Current Billing Cycle</Text>
						<Text>
							{new Date(year, month - 1, 1).toLocaleString(undefined, {
								month: "long",
							})}{" "}
							{year}
						</Text>
					</div>
				</div>
			</CardContent>

			<CardFooter>
				<span>
					Upgrade for{" "}
					<Link
						href="/pricing"
						target="_blank"
						className="border-b border-primary-500 text-primary-600 hover:text-zinc-900"
					>
						increased limits
					</Link>
					.
				</span>

				<CardFooterActions>
					{team.plan !== "FREE" ? <PortalButton teamId={team.id} /> : null}

					{team.isPersonal ? (
						team?.plan === "FREE" ? (
							<UpgradeButton teamId={team.id} />
						) : team?.plan === "PRO" ? (
							<Link href="mailto:support@planetfall.io?subject=planetfall.io enterprise upgrade">
								<Button> Upgrade to Enterprise</Button>
							</Link>
						) : null
					) : team?.plan === "DISABLED" ? (
						<UpgradeButton teamId={team.id} />
					) : (
						<Link href="mailto:support@planetfall.io">
							<Button>Upgrade to Enterprise</Button>
						</Link>
					)}
				</CardFooterActions>
			</CardFooter>
		</Card>
	);
};
