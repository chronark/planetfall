"use client";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/index";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Loading } from "@/components/loading";
import { Tag } from "@/components/tag";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  teamId: string;
  name: string;
};

export const ChangeNameCard: React.FC<Props> = ({ teamId, name }): JSX.Element => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { handleSubmit, register, formState } = useForm<{
    name: string;
  }>({ defaultValues: { name } });

  async function submit(data: { name: string }): Promise<void> {
    try {
      setLoading(true);
      await trpc.team.updateName.mutate({
        teamId,
        name: data.name,
      });
      addToast({
        title: "Success",
        content: `Your team has been renamed to ${data.name}`,
      });
      router.refresh();
    } catch (err) {
      addToast({
        title: "Error",
        variant: "error",
        content: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="">
      <Card>
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <CardDescription>
            The name of your team, this is what will be displayed on your team page and on your
            invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="name">Name</Label>
          <Input
            className="max-w-sm"
            type="text"
            {...register("name", {
              required: true,
            })}
          />
          {formState.errors.name ? (
            <p className="mt-2 text-sm text-red-500">
              {formState.errors.name.message || "A name is required"}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end">
          <Button isLoading={loading} type="submit">
            Save
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
