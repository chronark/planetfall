"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import React, { Fragment, useEffect, useState } from "react";
import { Button } from "./button";
import { Loading } from "./loading";
// import { Button } from "components";

export type ConfirmProps = {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  onConfirm: () => void | Promise<void>;
};

export const Confirm: React.FC<ConfirmProps> = (props): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [wantOpen, _setWantOpen] = useState(isOpen);

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
    <Dialog>
      <DialogTrigger asChild>{props.trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="submit" onClick={onConfirm}>
            {loading ? <Loading /> : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Confirm;
