import { WithAuth } from "../../../../components/auth";
import { Input, Output } from "../../../../../pinger/pages/api/v1/ping";
import { Layout } from "../../../../components/app/layout/nav";
import { Field, Form, handleSubmit, useForm } from "components";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormEvent, useState } from "react";

// async function submit={async (input) => {
//   const { data } = await trpc.useMutation("app.create").mutateAsync(input);
//   return data;
// }

const formValidation = z.object({
  url: z.string().url(),
});

async function onSubmit(data: z.infer<typeof formValidation>) {
  const input: Input = {
    headers: {
      "content-type": "application/json",
    },
    body: {
      url: data.url,
      method: "GET",
    },
    // timeout: 2000,
  };
  const res = await fetch("http://localhost:3030/api/v1/ping", {
    body: JSON.stringify(input.body),
    headers: input.headers,
    method: "POST",
  }).catch((err) => {
    console.error("ERROR", err);
    throw err;
  });
  const { latency, status } = (await res.json()) as Output;
  console.log({ latency, status });
}
export default function IndexPage() {
  const formCtx = useForm<z.infer<typeof formValidation>>({
    mode: "onBlur",
    resolver: zodResolver(formValidation),
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <WithAuth>
      <Layout
        breadcrumbs={[{
          label: "Home",
          href: "/app",
        }, {
          label: "Dashboard",
          href: "/app/dashboard",
        }]}
      >
        <div className="w-full">
          <div className="pb-6 bg-white rounded-md shadow-sm shadow-gray-200 ">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 lg:px-6">
              <h2 className="text-base font-semibold text-gray-800">
                Create Project
              </h2>
            </div>
            <div className="px-4 pt-4 lg:px-6 lg:pt-8">
              <Form
                ctx={formCtx}
                formError={formError}
                className="grid w-full grid-cols-1 gap-8 md:gap-10 lg:gap-12"
              >
                <Field.Input
                  name="url"
                  label="The public url of your endpoint"
                  type="text"
                />

                <button
                  disabled={submitting}
                  onClick={() =>
                    handleSubmit<z.infer<typeof formValidation>>(
                      formCtx,
                      onSubmit,
                      setSubmitting,
                      setFormError,
                    )}
                >
                  Create
                </button>
              </Form>
            </div>
          </div>
        </div>
      </Layout>
    </WithAuth>
  );
}
