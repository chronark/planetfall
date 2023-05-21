"use client";

import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { useState } from "react";
import { Button } from "@/components/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form"
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation"

import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";
import { trpc } from "@/lib/trpc/hooks";
import { Loading } from "./loading";
import { useToast } from "./toast";

const issueTypeSchema = z.enum(["bug", "feature", "security", "question"])

const severitySchema = z.enum(["p0", "p1", "p2", "p3"])



const issues: Record<z.infer<typeof issueTypeSchema>, string> = {
  bug: "Report a bug",
  feature: "Suggest a feature",
  security: "Report a security issue",
  question: "Something else",
}

const severities: Record<z.infer<typeof severitySchema>, string> = {
  p0: "Urgent",
  p1: "High",
  p2: "Normal",
  p3: "Low",
}

const schema = z.object({
  issueType: issueTypeSchema,
  severity: severitySchema,
  message: z.string().min(10),
})

export const Feedback: React.FC = () => {
  const [open, setOpen] = useState(false)
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues:{
      issueType: "bug",
      severity: "p3",
    }
  })
  const path = usePathname()
  const createIssue = trpc.plain.createIssue.useMutation()
  const { addToast } = useToast()
  function onSubmit(data: z.infer<typeof schema>) {

    createIssue.mutateAsync({
      path: path,
      issueType: data.issueType,
      severity: data.severity,
      message: data.message,


    }).then(() => {
      addToast({
        title: "Issue created",
        content: "Your issue has been created, we'll get back to you as soon as possible.",

      })
    }).catch((err) => {
      addToast({
        title: "Error",
        content: err.message,
        variant: "error",
      })
    }).finally(() => {
      setOpen(false)
    })
  }
  return (
    <Sheet open={open} onOpenChange={(o) => setOpen(o)}>
      <SheetTrigger asChild>
        <Button size="xs">Feedback</Button>
      </SheetTrigger>
      <SheetContent className="bg-white">
        <SheetHeader>
          <SheetTitle>Feedback</SheetTitle>
          <SheetDescription>


          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-8">

            <FormField

              control={form.control}
              name="issueType"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>How can we help?</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>

                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={issues.bug}/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(issues).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label} </SelectItem>
                          ))}

                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>

                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={severities.p3} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(severities).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label} </SelectItem>
                          ))}

                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Your message</FormLabel>
                  <FormControl>
                    <Textarea  {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full col-span-2" variant="primary" disabled={createIssue.isLoading}>{createIssue.isLoading ? <Loading /> : "Submit"}</Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
