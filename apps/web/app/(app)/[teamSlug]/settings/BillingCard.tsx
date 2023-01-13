"use client";
import React from "react";
import { Button, Card, Text } from "@/components/index";
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
	billingStart: number;
	billingEnd: number;
};

export const BillingCard: React.FC<Props> = ({
	usagePercentage,
	team,
	usage,
	billingStart,
	billingEnd,
}): JSX.Element => {
	return (
		<Card>
			<Card.Header>
				<Card.Header.Title
					title="Billing"
					subtitle={
						<Text>
							You are currently on the{" "}
							<span className="px-1 border rounded border-slate-300 bg-slate-50">
								{team.plan}
							</span>{" "}
							plan.
						</Text>
					}
				/>
			</Card.Header>

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
			<Card.Content>
				<div className="flex justify-around divide-x divide-slate-200">
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
							<div className="overflow-hidden bg-gray-200 rounded-full">
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
							{`${new Date(billingStart).toDateString()} - ${new Date(
								billingEnd,
							).toDateString()}`}
						</Text>
					</div>
				</div>
			</Card.Content>

			<Card.Footer>
				<span>
					Upgrade for{" "}
					<Link
						href="/pricing"
						target="_blank"
						className="border-b border-primary-500 text-primary-600 hover:text-slate-900"
					>
						increased limits
					</Link>
					.
				</span>

				<Card.Footer.Actions>
					{team.plan !== "FREE" ? <PortalButton teamId={team.id} /> : null}

					{team.isPersonal ? (
						team?.plan === "FREE" ? (
							<UpgradeButton teamId={team.id} />
						) : team?.plan === "PRO" ? (
							<Button href="mailto:support@planetfall.io?subject=planetfall.io enterprise upgrade">
								Upgrade to Enterprise
							</Button>
						) : null
					) : team?.plan === "DISABLED" ? (
						<UpgradeButton teamId={team.id} />
					) : (
						<Button href="mailto:support@planetfall.io">
							Upgrade to Enterprise
						</Button>
					)}
				</Card.Footer.Actions>
			</Card.Footer>
		</Card>
	);
};
