import { Text } from "../text";
import React, { useState } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";
import { CubeTexture } from "three";

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
            <Text color="text-red-500" size="sm">
              <span className="font-semibold">Error:</span> {formError}
            </Text>
          </div>
        )
        : null}
    </FormProvider>
  );
}
export async function handleSubmit<T extends FieldValues>(opts: {
  ctx: UseFormReturn<T>;
  submit: (values: T) => Promise<void>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setFormError: React.Dispatch<React.SetStateAction<string | null>>;
  onSuccess?: () => void;
}): Promise<void> {
  const values = opts.ctx.getValues();
  await opts.ctx.handleSubmit(
    async () => {
      opts.setLoading(true);
      await opts.submit(values).then(() => {
        if (opts.onSuccess) {
          opts.onSuccess();
        }
      })
        .catch((err) => {
          opts.setFormError(err.message ?? null);
        })
        .finally(() => opts.setLoading(false));
    },
    (err) => console.error("Form invalid", err),
  )();
}
