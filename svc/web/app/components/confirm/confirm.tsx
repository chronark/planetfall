"use client";
import { Transition } from "@headlessui/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import cx from "classnames";
import React, { Fragment, useEffect, useState } from "react";
import { Button } from "../button";
import { Heading } from "../heading";
import { Text } from "../text";
// import { Button } from "components";

export type ConfirmProps = {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  onConfirm: () => void | Promise<void>;
};

export const Confirm: React.FC<ConfirmProps> = (props): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [wantOpen, setWantOpen] = useState(isOpen);
  // const [loading, setLoading] = useState(false)

  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    setLoading(true);
    await props.onConfirm();
    setLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      setIsOpen(wantOpen);
    }
  }, [wantOpen, loading]);

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={setWantOpen}>
      <AlertDialog.Trigger asChild={true}>{props.trigger}</AlertDialog.Trigger>
      <Transition.Root show={isOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <AlertDialog.Overlay
            forceMount={true}
            className="fixed inset-0 z-20 bg-slate-900/50"
          />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <AlertDialog.Content
            forceMount={true}
            className={cx(
              "fixed z-50",
              "w-[95vw] max-w-md rounded p-4 md:w-full",
              "top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
              "bg-white dark:bg-gray-800",
              "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
            )}
          >
            <AlertDialog.Title>
              <Heading h3={true}>{props.title}</Heading>
            </AlertDialog.Title>
            <AlertDialog.Description>
              <p className="text-left">{props.description}</p>
            </AlertDialog.Description>

            <div className="pt-4 flex justify-end space-x-2 border-t border-slate-200 ">
              <AlertDialog.Cancel>
                <Button type="secondary">Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button type="primary" onClick={onConfirm}>
                  Confirm
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </Transition.Child>
      </Transition.Root>
    </AlertDialog.Root>
  );
};

export default Confirm;
