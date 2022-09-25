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
        <div className="absolute inset-0 w-screen h-screen b backdrop-blur [@supports(backdrop-filter:blur(0))]:bg-white/20 flex items-center justify-center z-50">
          <SignIn />
        </div>
      </SignedOut>
    </>
  );
};
