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
import { Preview } from "@react-email/preview";
import { Column } from "@react-email/column";
import { Row } from "@react-email/row";
import { Body } from "@react-email/body";

export type Props = {
  invitedFrom: string;
  team: string;
  username: string;
  inviteLink: string;
};

export function TeamInvitation({ invitedFrom, team, username, inviteLink }: Props) {
  return (
    <Tailwind>
      <Html className="font-sans text-zinc-800">
        <Head />
        <Preview>{`Join ${team} on Planetfall`}</Preview>
        <Body>
          <Container className="container mx-auto">
            <Section className="mt-8">
              <Img
                src="https://planetfall.io/logo.png"
                width="32"
                height="32"
                alt="Planetfall's Logo"
              />
            </Section>
            <Heading className="font-sans text-2xl text-semibold">
              Join <strong>{team}</strong> on <strong>Planetfall</strong>
            </Heading>

            <Text>Hello {username},</Text>
            <Text>
              <strong>{invitedFrom}</strong> has invited you to the <strong>{team}</strong> team on{" "}
              <strong>Planetfall</strong>.
            </Text>
            <Section
              style={{
                textAlign: "center",
                marginTop: "26px",
                marginBottom: "26px",
              }}
            >
              <Button
                className="px-4 py-2 font-medium text-white rounded bg-zinc-900"
                href={inviteLink}
              >
                Join the team
              </Button>
            </Section>
            <Text>
              or copy and paste this URL into your browser:{" "}
              <Link
                href={inviteLink}
                target="_blank"
                className="text-blue-600 decoration-none"
                rel="noreferrer"
              >
                {inviteLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default TeamInvitation;
