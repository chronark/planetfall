"use client";
import { Chat, PlainProvider } from "@team-plain/react-chat-ui";
import { useAuth } from "@clerk/nextjs/app-beta/client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/sheet";
import { Button } from "@/components/button";

export const SupportBubble: React.FC = () => {
  const auth = useAuth();
  console.log(auth.userId);
  const customer = auth.isSignedIn
    ? {
        type: "logged-in" as any,
        getCustomerJwt: () =>
          fetch("/api/v1/auth/user/jwt", { method: "POST" })
            .then((res) => res.json())
            .then((res) => res.token),
      }
    : undefined;

  const [open, setOpen] = useState(false);

  return (
    <div>
      <PlainProvider appKey={process.env.NEXT_PUBLIC_PLAIN_APP_KEY!} customer={customer}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="primary" size="xs">
              Support
            </Button>
          </SheetTrigger>
          <SheetContent position="right" size="default" className="bg-white">
            <Chat />
          </SheetContent>
        </Sheet>
      </PlainProvider>
    </div>
  );
};
