import { Text } from "../text";
export type StatsProps = {
	label: string;
	value: string | React.ReactNode;
	suffix?: string;
	status?: "warn" | "error";
};
export const Stats: React.FC<StatsProps> = ({
	label,
	value,
	status,
	suffix
}): JSX.Element => {
	return (
		<div className="flex flex-col p-4">
			<Text color="text-zinc-500">{label}</Text>
			<div className="flex items-baseline gap-2">
				<span
					className={`text-2xl font-medium md:text-4xl ${status === "warn"
						? "text-orange-500"
						: status === "error"
							? "text-rose-500"
							: "text-zinc-800"
						}`}
				>
					{value}
				</span>
				<span className="text-lg">{suffix}</span>
			</div>
		</div >
	);
};
