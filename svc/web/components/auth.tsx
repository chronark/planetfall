import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import React, { PropsWithChildren } from "react";

export const WithAuth: React.FC<PropsWithChildren> = (
  { children },
): JSX.Element => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="w-screen h-screen flex items-center justify-center">
          <SignIn />
        </div>
      </SignedOut>
    </>
  );
};
