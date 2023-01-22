"use client";
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
} from "@heroicons/react/24/outline";
import * as Dropdown from "@radix-ui/react-dropdown-menu";

type Props<TOptions extends unknown[]> = {
	options: TOptions;
	selected: string[];
	setSelected: (ids: string[]) => void;
};

export function MultiSelect<TOptions extends { id: string; name: string }[]>({
	options,
	selected,
	setSelected,
}: Props<TOptions>): JSX.Element {
	return (
		<Dropdown.Root>
			<Dropdown.Trigger asChild={true}>
				<button className="flex items-center gap-2 px-3 py-1 font-medium text-center transition-all duration-300 border rounded whitespace-nowrap focus:outline-none bg-zinc-800 text-zinc-50 hover:bg-zinc-50 hover:text-zinc-900 border-zinc-700 ">
					<ChevronDownIcon className="w-4 h-4" />
				</button>
			</Dropdown.Trigger>
			<Dropdown.Portal>
				<Dropdown.Content>
					<Dropdown.Group>
						{options.map((option, i) => (
							<Dropdown.CheckboxItem
								key={option.id}
								className={`hover:ring-0 gap-4 lg:gap-8 xl:gap-16 group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 ${
									option.id === selected ? "bg-zinc-100" : ""
								}`}
								checked={selected.includes(option.id)}
								onSelect={() => {
									setSelected();
								}}
							>
								<Dropdown.ItemIndicator>
									<CheckIcon className="w-4 h-4" />
								</Dropdown.ItemIndicator>
							</Dropdown.CheckboxItem>
						))}
					</Dropdown.Group>
				</Dropdown.Content>
			</Dropdown.Portal>
		</Dropdown.Root>
	);
}
