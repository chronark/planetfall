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
const defaultTheme = require("tailwindcss/defaultTheme");

export type Props = {
	time: number;
	error: string;
	teamSlug: string;
	endpointId: string;
	endpointName: string;
	/**
	 * The url to the failed check
	 */
	checkLink: string;
};

export function EndpointAlert({
	time = Date.now(),
	error = "error",
	teamSlug = "teamSlug",
	endpointId = "endpointId",
	endpointName = "endpointName",
	checkLink = "checkLink",
}: Props) {
	return (
		<Tailwind>
			<Html className="font-sans text-zinc-800">
				<Head />
				<Section className="bg-white">
					<Container className="container mx-auto">
						<Heading className="font-sans text-2xl text-semibold">
							Your Endpoint has failed
						</Heading>

						<Text>
							Your Endpoint <strong>{endpointName}</strong> has failed at{" "}
							<strong>{new Date(time).toISOString()}</strong> with the following
							error:
						</Text>
						<code className="inline-block w-full p-4 my-4 font-mono border rounded border-zinc-300 bg-zinc-100">
							{error}
						</code>

						<Button
							href={checkLink}
							className="px-8 py-4 mx-auto font-medium rounded bg-zinc-900 text-zinc-50 "
						>
							See More Details
						</Button>

						<Text className="text-zinc-600">
							You can manage your endpoint configuration in the app:{" "}
							<Link
								href={`https://planetfall.io/${teamSlug}/endpoints/${endpointId}`}
								target="_blank"
								className="underline text-zinc-800"
							>
								https://planetfall.io
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

export default EndpointAlert;
