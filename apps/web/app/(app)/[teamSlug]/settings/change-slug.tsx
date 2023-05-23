"use client";

import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  teamId: string;
  slug: string;
};

export const ChangeSlugCard: React.FC<Props> = ({ teamId, slug }): JSX.Element => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { handleSubmit, register, formState } = useForm<{
    slug: string;
  }>({ defaultValues: { slug } });

  async function submit(data: { slug: string }): Promise<void> {
    try {
      setLoading(true);
      await trpc.team.updateSlug.mutate({
        teamId,
        slug: data.slug,
      });
      addToast({
        title: "Success",
        content: `Your team slug has been changed to ${data.slug}`,
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
          <CardTitle>Slug</CardTitle>
          <CardDescription>
            The slug is used in the URL to identify your team. Slugs must only contain alphanumeric
            characters and - or _
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="slug">Slug</Label>
          <div className="mt-1 ">
            <Input
              className="max-w-sm"
              type="text"
              {...register("slug", {
                required: true,
              })}
            />
            {formState.errors.slug ? (
              <p className="mt-2 text-sm text-red-500">
                {formState.errors.slug.message || "A slug is required"}
              </p>
            ) : null}
          </div>
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
