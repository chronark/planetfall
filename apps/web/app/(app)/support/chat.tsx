"use client";
import { useSession } from "@clerk/nextjs";
import { PlainProvider, Chat as PlainChat } from "@team-plain/react-chat-ui";

export const Chat: React.FC = () => {
  const appKey = process.env.NEXT_PUBLIC_PLAIN_APP_KEY;
  if (!appKey) {
    return null;
  }
  const { session } = useSession();

  const getCustomerJwt = async (): Promise<string> => {
    if (!session) {
      return "";
    }
    const token = await session.getToken({ template: "plain" });
    if (!token) {
      return "";
    }
    return token;
  };

  return (
    <PlainProvider
      appKey={appKey}
      customer={{
        type: "logged-in",
        getCustomerJwt,
      }}
    >
      <div className="lg:h-[70vh]">
        <PlainChat />
      </div>
    </PlainProvider>
  );
};
