import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Section } from "@react-email/section";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import React from "react";

export type Props = {
  currentUsage: number;
  teamSlug: string;
  teamName: string;
  maxMonthlyRequests: number;
};

const fmt = new Intl.NumberFormat("en-US").format;

export function UsageExceeded({
  currentUsage = 0,
  teamSlug = "teamSlug",
  teamName = "teamName",
  maxMonthlyRequests = 5000000,
}: Props) {
  return (
    <Tailwind>
      <Html className="font-sans text-zinc-800">
        <Head />
        <Section className="bg-white">
          <Container className="container mx-auto">
            <Heading className="font-sans text-2xl text-semibold">
              Your team <strong>{teamName}</strong> has exceeded its quota.
            </Heading>
            <Text>
              You have made <strong>{fmt(currentUsage)}</strong> out of{" "}
              <strong>{fmt(maxMonthlyRequests)}</strong> checks this month.
            </Text>
            <Text>To keep using Planetfall, please upgrade your plan.</Text>
            <Section
              style={{
                textAlign: "center",
                marginTop: "26px",
                marginBottom: "26px",
              }}
            >
              <Button
                href={`https://planetfall.io/${teamSlug}/settings/plans`}
                style={{
                  // tailwind p- classes didn't work
                  padding: "8px 16px",
                }}
                className="px-8 py-4 mx-auto font-medium rounded bg-zinc-900 text-zinc-50"
              >
                Upgrade Plan
              </Button>
            </Section>

            <Text className="text-zinc-600">
              If you have questions, please reply to this email or talk to us at:{" "}
              <Link
                href="https://planetfall.io/support"
                target="_blank"
                className="underline text-zinc-800"
              >
                https://planetfall.io/support
              </Link>
            </Text>
            <Hr />

            <Img
              src="https://planetfall.io/logo.png"
              width="32"
              height="32"
              alt="Planetfall's Logo"
            />
            <Text>
              <Link
                href="https://planetfall.io"
                target="_blank"
                className="underline text-zinc-800"
              >
                Planetfall
              </Link>
              , Global Latency Monitoring
              <br />
            </Text>
          </Container>
        </Section>
      </Html>
    </Tailwind>
  );
}

export default UsageExceeded;
