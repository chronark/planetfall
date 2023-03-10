"use client";
import { PropsWithChildren } from "react";
import Script from "next/script";
import { Chat, PlainProvider } from "@team-plain/react-chat-ui";
import { useAuth } from "@clerk/nextjs";

export const SupportBubbleProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // const auth = useAuth();
  // console.log({ auth });
  // const customer = auth.isSignedIn
  //   ? {
  //       type: "logged-in" as any,
  //       getCustomerJwt: async () => {
  //         const jwt = await auth.getToken();
  //         console.log({ jwt });
  //         return jwt;
  //       },
  //     }
  //   : undefined;
  return (
    <PlainProvider appKey={process.env.NEXT_PUBLIC_PLAIN_APP_KEY!}>
      {children}
      <div className="0 w-screen h-screen">
        <div className="fixed right-0 bottom-0">
          <Chat />
        </div>
      </div>
    </PlainProvider>
  );
};
