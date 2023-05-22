"use client";
import { PageHeader } from "@/components/page";
import { Policy } from "@planetfall//policies";
import { Checkbox } from "@/components/checkbox";
import { Label } from "@/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { useToast } from "@/components/toast";
import { DeleteKeyButton } from "../delete-key";
import { Badge } from "@/components/badge";
import { Trash } from "lucide-react";
import { Button } from "@/components/button"

const allActions = ["create", "read", "update", "delete", "checks:read", "checks:write"];

type Props = {
  apiKey: {
    id: string;
    name: string;
    firstCharacters: string | null;
    createdAt: Date;
    policy: string | null;
  };
  endpointIdToName: Record<string, string>;
};
export const Client: React.FC<Props> = ({ apiKey, endpointIdToName }) => {
  const { addToast } = useToast();

  const policy = apiKey.policy ? Policy.parse(apiKey.policy) : null;

  return (

    <div>
      <PageHeader
        title={apiKey.name}
        description={`created at ${apiKey.createdAt.toUTCString()}`}
        actions={[
          <Badge key="key" size="md">{apiKey.firstCharacters ?? undefined}...</Badge>,
          <DeleteKeyButton key="delete" keyId={apiKey.id}>
            <Button variant="subtle" >
              <Trash className="w-4 h-4 mr-2" />
              <span>Revoke</span>
            </Button>
          </DeleteKeyButton>,
        ]}
      />
      <div className="mt-8 space-y-10 divide-y divide-zinc-900/10">
        {policy?.statements.map((statement, _i) => {
          return Object.entries(statement.resources).map(([resourceType, resources]) => (
            <div key={[statement, resourceType].join("-")} className="flex flex-col md:flex-row ">
              {/* <div className="w-full md:w-1/5">
    This is here in preparateion for the future where we'll have more than just channels
                                <CardHeader>
                                    <CardTitle>{resourceType}</CardTitle>
                                </CardHeader>

                            </div> */}
              <Card className="w-full ">
                <CardContent>
                  {Object.entries(resources ?? {}).map(([grid, permissions]) => {
                    return (
                      <div key={grid} className="flex flex-col items-start justify-between w-full gap-4 py-6 md:flex-row md:items-center">
                        <span className="text-sm font-medium leading-6 text-zinc-800">
                          {endpointIdToName[grid.split("::").at(-1) ?? ""]}
                        </span>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 justify-right">
                          {allActions.map((action) => (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                checked={permissions.includes(action)}
                                onClick={() => {
                                  addToast({
                                    title: "You can't update permissions yet",
                                    content: "Coming soon...",
                                  });
                                }}
                              />

                              <Label>{action}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ));
        })}
      </div>
    </div>
  );
};
