"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { trpc } from "@/lib/trpc";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import slugify from "slugify";
import type { Team } from "@planetfall/db";
import { Text } from "@/components/text";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/alert";
import { TRPCError } from "@trpc/server";
import { useRouter } from "next/navigation";

type Props = {
  user: {
    id: string;
    name: string;
  };
};

type FormParams = {
  name: string;
  slug: string;
};

function createSlug(s: string): string {
  return slugify(s, { lower: true, trim: true });
}

const slugRegex = /^[a-zA-Z0-9-_]+$/;

export const CreateTeam: React.FC<Props> = ({ user }) => {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!team) {
      return;
    }
    router.push(`/${team.slug}/endpoints`);
  }, [team, router]);

  const teamForm = useForm<FormParams>({
    defaultValues: {
      name: user.name,
      slug: createSlug(user.name),
    },
  });

  async function submit(data: FormParams) {
    try {
      setLoading(true);
      const newTeam = await trpc.team.create.mutate({
        name: data.name,
        slug: data.slug,
      });
      setTeam(newTeam);
    } catch (err) {
      if (err instanceof TRPCError && err.code === "CONFLICT") {
        setError("This slug is already taken");
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {team ? (
        <div>Setup Complete</div>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="primary" size="xl">
              Create your Team
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create your Team</AlertDialogTitle>
            </AlertDialogHeader>

            <form className="flex flex-col gap-4" onSubmit={teamForm.handleSubmit(submit)}>
              <div className="text-left">
                <Label htmlFor="name">Name</Label>
                <Text size="sm">
                  This is the visible name within Planetfall app and your invoices.
                </Text>
                <div className="mt-1 ">
                  <Input
                    type="text"
                    {...teamForm.register("name", {
                      required: true,
                    })}
                    defaultValue={teamForm.getValues().name}
                  />
                  {teamForm.formState.errors.name ? (
                    <p className="mt-2 text-sm text-red-500">
                      {teamForm.formState.errors.name.message || "A name is required"}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="text-left">
                <Label htmlFor="slug">Slug</Label>
                <Text size="sm">The slug is your unique namespace on Planetfall.</Text>
                <div className="relative flex w-full h-10 mt-1 overflow-hidden text-sm bg-transparent border rounded border-zinc-700 placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 ">
                  <span className="inline-flex items-center px-3 border-r bg-zinc-50 border-zinc-200 text-zinc-500 sm:text-sm">
                    https://planetfall/
                  </span>
                  <input
                    type="text"
                    {...teamForm.register("slug", {
                      required: true,
                      validate: (value) => slugRegex.test(value),
                    })}
                    defaultValue={createSlug(teamForm.getValues().name)}
                    className="w-full px-3 py-2 focus:outline-none focus:ring-0 focus:border-transparent"
                  />
                </div>
                {teamForm.formState.errors.slug ? (
                  <p className="mt-2 text-sm text-red-500">
                    {teamForm.formState.errors.slug.message ||
                      "Only alphanumeric characters, dashes and underscores are allowed"}
                  </p>
                ) : null}
              </div>
              {error ? <div className="mt-2 text-sm text-red-500">{error}</div> : null}
              <Button type="submit" variant="primary" isLoading={loading}>
                Create Team
              </Button>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
