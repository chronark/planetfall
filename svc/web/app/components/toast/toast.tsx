"use client";
import { XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { describe } from "node:test";
import React, { useEffect, useState } from "react";
import { Text } from "../text";
export interface ToastProps {
	/**
	 * Unique id
	 */
	id: string;
	/**
	 * How many seconds until the toast closes automatically.
	 * Set to 0 to disable
	 */
	ttl?: number;
	type?: "info" | "error";
	icon?: React.ReactNode;
	title?: string;
	content?: string;
}

export const Toast: React.FC<ToastProps> = ({
	id = crypto.randomUUID(),
	ttl = 5,
	type = "info",
	title,
	icon,
	content,
}): JSX.Element => {
	const [visible, setVisible] = useState(true);
	const remove = () => setVisible(false);
	useEffect(() => {
		if (ttl <= 0) {
			return;
		}
		setTimeout(() => {
			remove();
		}, ttl * 1000);
	}, [id, remove, ttl]);

	return (
		<AnimatePresence>
			{visible ? (
				<motion.div
					layout={true}
					key={id}
					initial={{ opacity: 0, x: 20, scale: 0.3 }}
					animate={{ opacity: 1, x: 0, scale: 1 }}
					exit={{ opacity: 0, y: 20, scale: 0.7 }}
					transition={{ type: "spring", stiffness: 500, damping: 50, mass: 1 }}
					role={type}
					className={classNames(
						"flex space-x-4 items-start relative px-6 py-4 rounded shadow-lg max-w-md border",
						{
							"text-black bg-white  border-zinc-500": type === "info",
							"bg-red-200 text-black border-red-500": type === "error",
						},
					)}
				>
					<>
						{icon ? { icon } : null}
						<div className="pr-4">
							<div className="space-y-1">
								<span className="text-sm font-medium text-zinc-900 whitespace-nowrap">
									{title}
								</span>
								<Text size="sm">{content}</Text>
							</div>
						</div>

						<button
							className="absolute top-0 right-0 p-2 text-2xl font-semibold leading-none bg-transparent outline-none focus:outline-none"
							onClick={() => remove()}
						>
							<XMarkIcon />
						</button>
					</>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
};
