import { Container } from "@react-email/container";
import { Button } from "@react-email/button";
import { Head } from "@react-email/head";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Heading } from "@react-email/heading";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import React from "react";
import { Tailwind } from "@react-email/tailwind";

export type Props = {
  username: string;
  teamSlug: string;
  teamName: string;
};

export function TrialEnded({
  teamSlug = "teamSlug",
  teamName = "teamName",
  username = "username",
}: Props) {
  return (
    <Tailwind>
      <Html className="font-sans text-zinc-800">
        <Head />
        <Section className="bg-white">
          <Container className="container mx-auto">
            <Heading className="font-sans text-2xl text-semibold">
              Your team <strong>{teamName}</strong> has reached the end of its trial.
            </Heading>
            <Text>Hey {username},</Text>
            <Text>
              The trial of your team <strong>{teamName}</strong> has ended.
            </Text>
            <Text>
              To keep using Planetfall, please{" "}
              <Link href={`https://planetfall.io/${teamSlug}/settings/usage`}>
                add a billing method
              </Link>{" "}
              or <Link href="mailto:support@planetfall.io">contact us</Link> for an extended trial.
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

export default TrialEnded;
