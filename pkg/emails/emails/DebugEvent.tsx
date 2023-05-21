import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Section } from "@react-email/section";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import React from "react";

export type Props = {
  time: number;
  data: Record<string, unknown>;
};

export function DebugEvent({ time = Date.now(), data }: Props) {
  return (
    <Tailwind>
      <Html className="font-sans text-zinc-800">
        <Head />
        <Section className="bg-white">
          <Container className="container mx-auto">
            <Heading className="font-sans text-2xl text-semibold">Debug Event</Heading>

            <Text>New debug event at {new Date(time).toISOString()}:</Text>
            <code>
              <pre className="inline-block w-full p-4 my-4 font-mono border rounded border-zinc-300 bg-zinc-100">
                {JSON.stringify(data, null, 2)}
              </pre>
            </code>
          </Container>
        </Section>
      </Html>
    </Tailwind>
  );
}

export default DebugEvent;
