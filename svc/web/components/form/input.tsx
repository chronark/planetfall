import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "components";
import classNames from "classnames";
import cn from "classnames";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";

type TextAlignment = "left" | "center" | "right";

export interface InputProps {
  disabled?: boolean;
  /**
   * Field name. Make sure this matches your schema.
   */
  name: string;

  /**
   * Field label.
   */
  label: string;

  hideLabel?: boolean;
  /**
   *  Field type. Doesn't include radio buttons and checkboxes
   */
  type?: "text" | "password" | "email" | "number" | "date";

  iconLeft?: React.ReactNode;

  defaultValue?: string | number;
  help?: React.ReactNode;

  placeholder?: string;
  autoFocus?: boolean;
  textAlignment?: TextAlignment;
}

export const Input: React.FC<InputProps> = ({
  disabled,
  label,
  hideLabel,
  name,
  iconLeft,
  type,
  defaultValue,
  help,
  placeholder,
  autoFocus = false,
  textAlignment = "center",
}) => {
  const {
    register,
    formState: { isSubmitting, errors },
    setValue,
  } = useFormContext();
  const error = errors[name]?.message || errors[name];

  useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue);
    }
  }, [defaultValue, name, setValue]);
  return (
    <div className="w-full text-slate-800 ">
      <label
        htmlFor={name}
        className={cn(
          "block text-sm font-semibold text-slate-700",
          {
            "sr-only": hideLabel,
          },
        )}
      >
        {label}
        {help ? <Tooltip side="bottom">{help}</Tooltip> : null}
      </label>
      <div className="relative mt-1">
        {iconLeft
          ? (
            <div className="absolute inset-y-0 left-0 flex items-center overflow-hidden rounded-l pointer-events-none">
              <div className="flex items-center justify-center w-10 h-10 overflow-hidden rounded-l">
                <div className="w-8 h-8 p-1 border-r">{iconLeft}</div>
              </div>
            </div>
          )
          : null}
        <input
          id={name}
          disabled={disabled || isSubmitting}
          {...register(name)}
          type={type}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={classNames(
            "h-10 w-full px-3 focus:shadow placeholder-slate-500 transition duration-500 border  rounded focus:outline-none",
            {
              "border-slate-200 focus:border-slate-700 focus:bg-slate-50":
                !error,
              "border-error focus:border-red-700 focus:bg-red-50": error,
              "appearance-none bg-transparent": isSubmitting,
            },
          )}
        />
      </div>

      {error
        ? (
          <div className="flex items-center pt-2 pb-4 space-x-1 text-sm text-red-500">
            <ExclamationTriangleIcon className="w-4 h-4" />
            <p>
              <>
                <span className="font-semibold">Error:</span> {error}
              </>
            </p>
          </div>
        )
        : null}
    </div>
  );
};

export default Input;
