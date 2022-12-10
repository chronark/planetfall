import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import React from "react";

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
	time,
	error,
	teamSlug,
	endpointId,
	endpointName,
	checkLink,
}: Props) {
	return (
		<Html>
			<Head />
			<Preview>Your Endpoint has failed</Preview>
			<Section style={main}>
				<Container style={container}>
					<Text style={h1}>Your Endpoint has failed</Text>

					<Text style={{ ...text, marginBottom: "14px" }}>
						Your Endpoint <strong>{endpointName}</strong> has failed at{" "}
						<strong>{new Date(time).toISOString()}</strong> with the following
						error:
					</Text>
					<code style={code}>{error}</code>

					<Text style={text}>
						If you want to see the full error, you can visit the following link:
						<Link
							href={checkLink}
							target="_blank"
							style={{
								...link,
								display: "block",
								marginBottom: "16px",
							}}
						>
							{checkLink}
						</Link>
					</Text>

					<Text
						style={{
							...text,
							color: "#ababab",
							marginTop: "12px",
						}}
					>
						Hint: You can manage your endpoint configuration in the app:{" "}
						<Link
							href={`https://planetfall.io/${teamSlug}/endpoints/${endpointId}`}
							target="_blank"
							style={{ ...link, color: "#898989" }}
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
					<Text style={footer}>
						<Link
							href="https://planetfall.io"
							target="_blank"
							style={{ ...link, color: "#898989" }}
						>
							Planetfall
						</Link>
						, Global Latency Monitoring
						<br />
					</Text>
				</Container>
			</Section>
		</Html>
	);
}

const main = {
	backgroundColor: "#ffffff",
};

const container = {
	paddingLeft: "12px",
	paddingRight: "12px",
	margin: "0 auto",
};

const h1 = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "24px",
	fontWeight: "bold",
	margin: "40px 0",
	padding: "0",
};

const link = {
	color: "#2754C5",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	textDecoration: "underline",
};

const text = {
	color: "#333",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	margin: "24px 0",
};

const footer = {
	color: "#898989",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "12px",
	lineHeight: "22px",
	marginTop: "12px",
	marginBottom: "24px",
};

const code = {
	display: "inline-block",
	padding: "16px 4.5%",
	width: "90.5%",
	backgroundColor: "#f4f4f4",
	borderRadius: "5px",
	border: "1px solid #eee",
	color: "#333",
};
