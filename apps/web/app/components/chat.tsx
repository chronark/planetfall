"use client";
import { Chat as PlainChat, PlainProvider, Customer } from "@team-plain/react-chat-ui";
import { useAuth, useUser } from "@clerk/nextjs/app-beta/client"

export const Chat: React.FC = () => {
    const auth = useAuth()
    const customer = auth.isSignedIn ? {
        type: "logged-in",
        getCustomerJwt: auth.getToken()

    } : {
        type: "logged-out"
    }
    return (
        <PlainProvider appKey="appKey_uk_01GTMCKHYR6PD0WKNB61TQ0WS0" customer={customer} >
            <PlainChat />
        </PlainProvider>
    );
};
