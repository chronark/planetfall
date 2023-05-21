"use client";
import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export const SentryIdentifyUser: React.FC = () => {
  const { user } = useUser();
  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.emailAddresses.at(0)?.emailAddress,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);
  return null;
};
