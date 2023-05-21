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
import Confirm from "@/components/confirm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/dialog";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { PageHeader } from "@/components/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs/tabs";
import { Text } from "@/components/text";
import { useToast } from "@/components/toast";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
  user: {
    id: string;
  };
  team: {
    id: string;
    slug: string;
  };
  alerts: {
    id: string;
    endpoints: {
      id: string;
      name: string;
      url: string;
    }[];

    emailChannels: {
      id: string;
      email: string;
    }[];
    slackChannels: {
      id: string;
      url: string;
    }[];
  }[];

  endpoints: {
    id: string;
    name: string;
  }[];
};

type CreateForm =
  | {
      email: string;
      slackUrl?: never;
    }
  | {
      slackUrl: string;
      email?: never;
    };

export const ClientPage: React.FC<Props> = ({ endpoints, team, alerts }) => {
  const [showNewAlertModal, setShowNewAlertModal] = useState(false);
  const [selectedEndpointIds, setSelectedEndpointIds] = useState<string[]>([]);
  const [_addEndpointId, _setAddEndpointId] = useState<string | null>(null);
  const [_addEndpointIdLoading, _setAddEndpointIdLoading] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();
  const createForm = useForm<CreateForm>({});

  async function submit(data: CreateForm) {
    try {
      setLoading(true);
      if (selectedEndpointIds.length === 0) {
        setShowNewAlertModal(false);
        addToast({
          title: "Error",
          content: "Please select an endpoint",
          variant: "error",
        });
        return;
      }
      if (data.email) {
        await trpc.alerts.createEmailAlert.mutate({
          email: data.email,
          teamId: team.id,
          endpointIds: selectedEndpointIds,
        });
      } else if (data.slackUrl) {
        await trpc.alerts.createSlackAlert.mutate({
          slackUrl: data.slackUrl,
          teamId: team.id,
          endpointIds: selectedEndpointIds,
        });
      }
      setShowNewAlertModal(false);
      router.refresh();
    } catch (e) {
      addToast({
        title: "Error",
        content: (e as Error).message,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Alerts"
        description="Configure who gets notified when things go wrong."
        actions={[
          <Dialog
            key="create"
            open={showNewAlertModal}
            onOpenChange={(open) => setShowNewAlertModal(open)}
          >
            <DialogTrigger>
              <Button isLoading={loading} variant="primary">
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={createForm.handleSubmit(submit)}>
                <DialogHeader>
                  <Heading h3>Create a new alert</Heading>
                  <Text>Select the endpoints you want to be notified about:</Text>
                </DialogHeader>

                <div className="flex flex-col gap-2 mt-8">
                  {endpoints.map((e) => (
                    <div key={e.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={e.id}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEndpointIds([...selectedEndpointIds, e.id]);
                          } else {
                            setSelectedEndpointIds(selectedEndpointIds.filter((id) => id !== e.id));
                          }
                        }}
                      />
                      <label
                        htmlFor={e.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {e.name}
                      </label>
                    </div>
                  ))}

                  <Tabs defaultValue="slack" className="mt-8">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="email">Email</TabsTrigger>
                      <TabsTrigger value="slack">Slack</TabsTrigger>
                    </TabsList>
                    <TabsContent value="email" className="mt-8">
                      <Label>Email</Label>
                      <Input type="email" {...createForm.register("email")} />
                    </TabsContent>
                    <TabsContent value="slack">
                      <Label>Slack Url</Label>
                      <Input type="slack" {...createForm.register("slackUrl")} />
                    </TabsContent>
                  </Tabs>
                </div>
                <DialogFooter className="mt-8">
                  <Button variant="primary" type="submit" isLoading={loading}>
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>,
        ]}
      />
      <main className="container mx-auto mt-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 ">
          {alerts.map((alert) => (
            <Alert key={alert.id} alert={alert} endpoints={endpoints} />
          ))}
        </div>
      </main>
    </div>
  );
};

type AlertProps = {
  alert: {
    id: string;
    endpoints: {
      id: string;
      name: string;
      url: string;
    }[];

    emailChannels: {
      id: string;
      email: string;
    }[];
    slackChannels: {
      id: string;
      url: string;
    }[];
  };

  endpoints: {
    id: string;
    name: string;
  }[];
};

const Alert: React.FC<AlertProps> = ({ alert, endpoints }) => {
  const router = useRouter();
  const [selectedEndpointIds, setSelectedEndpointIds] = useState<string[]>(
    alert.endpoints.map((e) => e.id),
  );
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  return (
    <Card key={alert.id}>
      <CardHeader>
        <CardTitle>{alert.emailChannels.at(0)?.email ? "Email" : "Slack"}</CardTitle>
        <CardDescription>
          {alert.emailChannels.at(0)?.email ?? alert.slackChannels.at(0)?.url}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {endpoints.map((endpoint) => {
            return (
              <div key={endpoint.id} className="flex items-center space-x-2">
                <Checkbox
                  id={endpoint.id}
                  checked={selectedEndpointIds.includes(endpoint.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedEndpointIds([...selectedEndpointIds, endpoint.id]);
                    } else {
                      setSelectedEndpointIds(
                        selectedEndpointIds.filter((id) => id !== endpoint.id),
                      );
                    }
                  }}
                />
                <label
                  htmlFor={endpoint.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {endpoint.name}
                </label>
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="justify-end gap-4">
        <Confirm
          variant="danger"
          key="delete"
          title="Delete Alert"
          description={"Do you really want to delete this alert?"}
          onConfirm={async () => {
            await trpc.alerts.delete.mutate({ alertId: alert.id });
            router.refresh();
          }}
          trigger={<Button variant="danger">Delete</Button>}
        />

        <Button
          isLoading={isLoading}
          onClick={async () => {
            setIsLoading(true);
            await trpc.alerts.update
              .mutate({
                alertId: alert.id,
                endpointIds: selectedEndpointIds,
              })
              .catch((err) => {
                addToast({
                  title: "Error updating endpoints",
                  content: err.message,
                  variant: "error",
                });
              });
            setIsLoading(false);
            router.refresh();
          }}
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};
