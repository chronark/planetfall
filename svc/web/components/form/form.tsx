import { Text } from "../text";
import React from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";

export interface FormProps<T extends FieldValues> {
  ctx: UseFormReturn<T>;
  formError: React.ReactNode | null;
  children: React.ReactNode;
  className?: string;
  onSubmit?: () => void;
}

export function Form<T extends FieldValues>({
  ctx,
  formError,
  children,
  className,
  onSubmit,
}: FormProps<T>): JSX.Element {
  return (
    <FormProvider {...ctx}>
      <form className={className} onSubmit={onSubmit}>
        {children}
      </form>
      {formError
        ? (
          <div role="alert" className="pt-2 pb-4">
            <Text color="text-error" size="sm">
              <span className="font-semibold">Error:</span> {formError}
            </Text>
          </div>
        )
        : null}
    </FormProvider>
  );
}

export async function handleSubmit<T extends FieldValues>(
  ctx: UseFormReturn<T>,
  onSubmit: (values: T) => Promise<void>,
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>,
  setFormError: React.Dispatch<React.SetStateAction<string | null>>,
): Promise<void> {
  const values = ctx.getValues();
  await ctx.handleSubmit(
    async () => {
      setSubmitting(true);
      await onSubmit(values)
        .catch((err) => {
          setFormError(err.message ?? null);
        })
        .finally(() => setSubmitting(false));
    },
    (err) => console.error("Form invalid", err),
  )();
}
