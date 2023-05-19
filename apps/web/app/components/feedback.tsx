"use client";

import { useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";

const _formOptions = [
  {
    label: "Report a bug",
    value: "bug" as const,
  },
  {
    label: "Book a demo",
    value: "demo" as const,
  },
  {
    label: "Suggest a feature",
    value: "feature" as const,
  },
  {
    label: "Report a security issue",
    value: "security" as const,
  },
  {
    label: "Something else",
    value: "question" as const,
  },
];

// type Props = {
//   trigger: React.ReactNode;
// };

export const Feedback: React.FC = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="xs">Feedback</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Feedback</SheetTitle>
          <SheetDescription>How can we help?</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
