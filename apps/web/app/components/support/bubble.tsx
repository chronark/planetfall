"use client";
import { Button } from "@/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/sheet";
import { useAuth } from "@clerk/nextjs/app-beta/client";
import { Chat, PlainProvider } from "@team-plain/react-chat-ui";

export const SupportBubble: React.FC = () => {
  const auth = useAuth();
  const customer = auth.isSignedIn
    ? {
        type: "logged-in" as any,
        getCustomerJwt: () =>
          fetch("/api/v1/auth/user/jwt", { method: "POST" })
            .then((res) => res.json())
            .then((res) => res.token),
      }
    : undefined;

  return (
    <PlainProvider appKey={process.env.NEXT_PUBLIC_PLAIN_APP_KEY!} customer={customer}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="primary" size="xs">
            Support
          </Button>
        </SheetTrigger>

        <SheetContent position="right" size="auto" className="bg-white">
          <Chat />
        </SheetContent>
      </Sheet>
    </PlainProvider>
  );
};
