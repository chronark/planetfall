"use client";

import { ToastProvider, Toaster } from "@/components/toast";
import React, { PropsWithChildren } from "react";

export const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <ToastProvider>
      <Toaster />
      {children}
    </ToastProvider>
  );
};
