"use client";
import { Button } from "@/components/button";
import React from "react";

import { ScrollArea } from "@/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/sheet";
import { trpc } from "@/lib/trpc/hooks";
import classNames from "classnames";
import { CheckIcon } from "lucide-react";
import ms from "ms";

type Props = {
  endpointId: string;
};

export const EndpointAuditLog: React.FC<Props> = ({ endpointId }) => {
  const auditLogs = trpc.endpoint.auditLogs.useQuery({ endpointId });
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Changelog</Button>
      </SheetTrigger>
      <SheetContent className="bg-white " size="content">
        <SheetHeader>
          <SheetTitle>Changelog</SheetTitle>
          <SheetDescription>Who changed this endpoint?</SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6">
          <ul role="list" className="space-y-6">
            {auditLogs.data
              ?.sort((a, b) => b.time.getTime() - a.time.getTime())
              .map((event, i) => (
                <li key={event.id} className="relative flex gap-x-4">
                  <div
                    className={classNames(
                      i === auditLogs.data?.length - 1 ? "h-6" : "-bottom-6",
                      "absolute left-0 top-0 flex w-6 justify-center",
                    )}
                  >
                    <div className="w-px bg-gray-200" />
                  </div>
                  {event.user ? (
                    <>
                      <img
                        src={event.user.image ?? ""}
                        alt=""
                        className="relative flex-none w-6 h-6 mt-3 rounded-full bg-gray-50"
                      />
                      <div className="flex-auto p-3 rounded-md ring-1 ring-inset ring-gray-200">
                        <div className="flex justify-between gap-x-4">
                          <div className="py-0.5 text-xs leading-5 text-gray-500">
                            <span className="font-medium text-gray-900">{event.user.name}</span>
                          </div>
                          <time
                            dateTime={event.time.toUTCString()}
                            className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                          >
                            {ms(Date.now() - event.time.getTime())} ago
                          </time>
                        </div>
                        <p className="text-sm leading-6 text-gray-500">{event.message}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative flex items-center justify-center flex-none w-6 h-6 bg-white">
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                      </div>
                      <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                        <span className="font-medium text-gray-900">{event.userId}</span>{" "}
                        {event.message}
                      </p>
                      <time
                        dateTime={event.time.toUTCString()}
                        className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                      >
                        {ms(Date.now() - event.time.getTime())} ago
                      </time>
                    </>
                  )}
                </li>
              ))}
          </ul>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
