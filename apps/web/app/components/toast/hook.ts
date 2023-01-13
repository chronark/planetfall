import { useContext, useId } from "react";
import { ToasterContext } from "./provider";
import { ToastProps } from "./toast";

type CreateToastProps = Omit<ToastProps, "id" | "remove">;

export type ToastHook = {
	/**
	 * Stores all active toasts
	 */
	getToasts: () => ToastProps[];

	/**
	 * Push a new toast to the stack
	 */
	addToast: (toast: CreateToastProps) => void;
	/**
	 * Remove all toasts
	 */
	clearToasts: () => void;
};

export const useToaster = (): ToastHook => {
	const ctx = useContext(ToasterContext);

	return {
		getToasts: () => ctx.toasts,
		addToast: (toast: CreateToastProps) => {
			ctx.setToasts([
				...ctx.toasts,
				{
					...toast,
					id: crypto.randomUUID(),
				},
			]);
		},
		clearToasts: () => ctx.setToasts([]),
	};
};
