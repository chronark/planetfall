import { AccessControl } from "@chronark/access";

export type Statements = {
	endpoint: ["create", "read", "update", "delete"];
	page: ["create", "read", "update", "delete"];
	check: ["trigger", "read"];
};

export const ac = new AccessControl<Statements>();

export const roles = {
	root: ac.newRole({
		endpoint: ["create", "read", "update", "delete"],
		page: ["create", "read", "update", "delete"],
		check: ["trigger", "read"],
	}),
};
