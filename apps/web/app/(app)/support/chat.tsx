"use client";
import { PlainProvider, Chat as PlainChat } from "@team-plain/react-chat-ui";
export const Chat: React.FC = () => {
  return (
    <PlainProvider
      appKey={process.env.NEXT_PUBLIC_PLAIN_APP_KEY!}
      customer={{
        type: "logged-in",
        getCustomerJwt: async () => {
          const jwt = await fetch("/api/v1/auth/user/jwt", { method: "POST" })
            .then((res) => res.json())
            .then((res) => res.token);
          return jwt;
        },
      }}
    >
      <PlainChat />
    </PlainProvider>
  );
};
