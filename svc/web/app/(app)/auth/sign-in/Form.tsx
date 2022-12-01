"use client";

import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { Button } from "@/components/button";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const Form: React.FC = () => {
	const [state, setState] = useState<"idle" | "loading" | "sent">("idle");

	const [email, setEmail] = useState("");

	if (state === "sent") {
		return (
			<div className="flex flex-col items-center justify-center px-4 py-6 pt-8 space-y-3 text-center">
				<h2 className="text-2xl font-semibold text-zinc-900">
					Check Your Email
				</h2>
				<p className="mt-2 text-sm text-zinc-600">
					{" "}
					A sign in link has been sent to {email}
				</p>
			</div>
		);
	}
	return (
		<div className="z-10 w-full max-w-md overflow-hidden border rounded shadow-xl border-zinc-200">
			<div className="flex flex-col items-center justify-center px-4 py-6 pt-8 space-y-3 text-center bg-white border-b border-zinc-200 sm:px-16">
				<Link href="https://planetfall.io">
					<Logo className="w-10 h-10" />
				</Link>
				<h3 className="text-xl font-semibold">Sign In</h3>
				<p className="text-sm text-zinc-500">
					Use your GitHub account to sign in.
				</p>
				<div className="mt-4">
					<Button
						loading={state === "loading"}
						size="lg"
						type="primary"
						iconLeft={
							<svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
									clipRule="evenodd"
								/>
							</svg>
						}
						onClick={async () => {
							setState("loading");
							await signIn("github");
							setState("idle");
						}}
					>
						Sign in with GitHub
					</Button>{" "}
				</div>
			</div>
			<div className="p-4 sm:px-16">
				<p className="text-sm text-center text-zinc-500">
					Or enter your email address to receive a magic link.
				</p>
				<form
					className="flex flex-col w-full gap-4 py-4 lg:py-8"
					onSubmit={async (e) => {
						e.preventDefault();
						setState("loading");
						await signIn("email", { email, redirect: false });
						setState("sent");
					}}
				>
					<input
						placeholder="chronark@planetfall.io"
						className="w-full px-3 py-1 text-center duration-500 bg-white border rounded text-md text-zinc-700 border-zinc-700 hover:borde-zinc-900 hover:bg-zinc-300 hover:text-zinc-900 focus:outline-none"
						type="email"
						value={email}
						onChange={(e) => {
							e.preventDefault();
							setEmail(e.target.value);
						}}
					/>

					<Button
						loading={state === "loading"}
						size="md"
						type="secondary"
						htmlType="submit"
						iconLeft={<EnvelopeIcon />}
					>
						Send Magic Link
					</Button>
				</form>
			</div>
		</div>
	);
};
