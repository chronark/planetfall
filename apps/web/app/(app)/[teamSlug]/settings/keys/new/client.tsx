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
import { Checkbox } from "@/components/checkbox";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { PageHeader } from "@/components/page";
import { trpc } from "@/lib/trpc/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Loading } from "@/components/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import { AlertTriangle } from "lucide-react";
import { addToast } from "@/components/toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { CopyButton } from "@/components/copy-button";
type Props = {
  team: {
    id: string;
    slug: string;
    endpoints: {
      id: string;
      name: string;
    }[];
  };
};

const FormSchema = z.record(
  z.object({
    create: z.boolean(),
    read: z.boolean(),
    update: z.boolean(),
    delete: z.boolean(),
    "events:read": z.boolean(),
    "events:create": z.boolean(),
  }),
);

export const ClientPage: React.FC<Props> = ({ team }) => {
  const [rootKeyModalOpen, setRootKeyModalOpen] = useState(false);

  const actions = ["create", "read", "update", "delete", "checks:read", "checks:write"] as const;
  type Action = typeof actions[number];

  type FormData = {
    [endpointId: string]: {
      [action in Action]: boolean;
    };
  };

  const [name, setName] = useState<string | null>(null);
  const router = useRouter();
  const [form, setForm] = useState<FormData>(
    team.endpoints.reduce((acc, endpoint) => {
      acc[endpoint.id] = {
        create: false,
        read: false,
        update: false,
        delete: false,
        "checks:read": false,
        "checks:write": false,
      };
      return acc;
    }, {} as FormData),
  );

  function updatePermission(endpointId: string, action: Action, allowed: boolean) {
    setForm({
      ...form,
      [endpointId]: {
        ...form[endpointId],
        [action]: allowed,
      },
    });
  }

  const key = trpc.apikey.create.useMutation({
    onError(err) {
      setRootKeyModalOpen(false);
      console.error(err);
      addToast({
        title: "Error",
        content: err.message,
        variant: "error",
      });
    },
  });

  const snippet = `curl 'http://localhost:3003/v1/endpoints' \\
  -H "Authorization: ${key.data?.apiKey}"
`;

  return (
    <div>
      <PageHeader
        title="Create API Key"
        description="Create a fine grained API key to access your endpoints"
        actions={[
          <Dialog key="root-key" open={rootKeyModalOpen} onOpenChange={setRootKeyModalOpen}>
            <DialogTrigger asChild>
              <Button variant="subtle">Create Root Key</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {" "}
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Root keys can be dangerous
                </DialogTitle>
                <DialogDescription>
                  The root key will provide full read and write access to all current and future
                  resources.
                  <br />
                  For production use, we recommend creating a key with only the permissions you
                  need.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() =>
                    key.mutate({
                      teamId: team.id,
                      name: name ?? "default",
                      permissions: { endpoints: "*" },
                    })
                  }
                >
                  {key.isLoading ? <Loading /> : "Confirm"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>,
        ]}
      />
      <main className="container mx-auto mt-8">
        {key.data ? (
          <Dialog defaultOpen>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Your API Key</DialogTitle>
                <DialogDescription>
                  This key is only shown once and can not be recovered. Please store it somewhere
                  safe.
                </DialogDescription>
                <div>
                  {key.data.root ? (
                    <Alert variant="warn" className="my-4">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertTitle>Root Key Generated</AlertTitle>
                      <AlertDescription>
                        The root key will provide full read and write access to all current and
                        future resources.
                        <br />
                        For production use, we recommend creating a key with only the permissions
                        you need.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-4 px-2 py-1 mt-4 border rounded lg:p-4 border-white/10 bg-zinc-100 dark:bg-zinc-900">
                  <pre className="font-mono">{key.data.apiKey}</pre>
                  <CopyButton value={key.data.apiKey} />
                </div>
              </DialogHeader>

              <p className="mt-2 text-sm font-medium text-center text-zinc-100 ">
                Try it out with curl
              </p>
              <div className="flex items-start justify-between gap-4 px-2 py-1 border rounded lg:p-4 border-white/10 bg-zinc-100 dark:bg-zinc-900">
                <pre className="font-mono">{snippet}</pre>
                <CopyButton value={snippet} />
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>New Fine Grained Key</CardTitle>
            <CardDescription>
              Give your key a name and select the endpoints and actions it should grant access to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col mt-4 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Give this key a name if you want"
                value={name ?? undefined}
                onChange={(v) => setName(v.currentTarget.value)}
              />
            </div>

            <ul className="divide-y divide-white/10">
              {team.endpoints.map((endpoint) => (
                <div key={endpoint.id} className="flex items-center justify-between w-full py-6 ">
                  <span className="text-sm font-medium leading-6 text-zinc-900">
                    {endpoint.name}
                  </span>
                  <div className="flex items-center gap-4 text-sm text-zinc-460 justify-right">
                    {actions.map((action) => (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${endpoint.id}-${action}`}
                          onCheckedChange={(v) => {
                            updatePermission(endpoint.id, action, Boolean(v));
                          }}
                        />
                        <Label htmlFor={`${endpoint.id}-${action}`}>{action}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-2 ">
            <Button
              variant="primary"
              onClick={() =>
                key.mutate({
                  teamId: team.id,
                  name: name ?? "default",
                  permissions: { endpoints: form },
                })
              }
              disabled={key.isLoading || team.endpoints.length === 0}
            >
              {key.isLoading ? <Loading /> : "Create"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};
