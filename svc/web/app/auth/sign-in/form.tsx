"use client";
import Button from "@/components/button/button";
import { signIn } from "next-auth/react";
import React from "react";

export const Form: React.FC = () => {
	return (
		<Button
			onClick={() => {
				signIn("github");
			}}
		>
			Sign in
		</Button>
	);
};
