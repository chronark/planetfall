"use client";
import { Alert } from "@/components/alert";
import { AlertTitle } from "@/components/alert";
import { AlertDescription } from "@/components/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { Text } from "@/components/text";
import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { Toaster, useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc/hooks";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  teamSlug: string;
  teamId: string;
};

type FormData = {
  slug: string;
};
export const DeleteCard: React.FC<Props> = ({ teamSlug, teamId }): JSX.Element => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    getValues,
    control,
    watch,
  } = useForm<{ slug: string }>({ reValidateMode: "onSubmit" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const deletion = trpc.team.delete.useMutation();
  const { addToast } = useToast();
  async function submit(data: FormData) {
    if (data.slug !== teamSlug) {
      setError("slug", { message: "Slug must match" });
      return;
    }
    setLoading(true);
    try {
      await deletion.mutateAsync({ teamId });
      router.push("/home");
    } catch (err) {
      console.error(err);
      addToast({
        title: "Error",
        content: (err as Error).message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card>
      <Toaster />
      <CardHeader
        actions={[
          <Dialog key="delete">
            <DialogTrigger asChild>
              <Button variant="danger">Delete Team</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete {teamSlug}?</DialogTitle>

                <Alert variant="destructive">
                  <AlertTitle>This is a permanent action and cannot be undone.</AlertTitle>
                  <AlertDescription>
                    This will permanently delete your account and remove your data from our servers.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit(submit)} className="mt-4 md:mt-8">
                  <Text>
                    Enter the team name <span className="font-semibold">{teamSlug}</span> to
                    continue:
                  </Text>
                  <div className="mt-1 ">
                    <Input
                      type="text"
                      {...register("slug", {
                        required: true,
                      })}
                      placeholder={teamSlug}
                    />
                    {errors.slug ? (
                      <p className="mt-2 text-sm text-red-500">{errors.slug.message}</p>
                    ) : null}
                  </div>

                  <div className="flex justify-end w-full mt-4">
                    <Button type="submit" variant="danger">
                      {loading ? <Loading /> : "Delete Permanently"}
                    </Button>
                  </div>
                </form>
              </DialogHeader>
            </DialogContent>
          </Dialog>,
        ]}
      >
        <CardTitle>Delete Team</CardTitle>
        <CardDescription>
          Deleting your team will stop all checks for all endpoints and create a final invoice.
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
