import { Policy as GenericPolicy } from "@chronark/access-policies";

export type Resources = {
  endpoint: [
    /**
     * Create a new endpoint
     */
    "create",
    /**
     * Read endpoint config
     */
    "read",
    /**
     * Change an existing endpoint's configuration
     */
    "update",
    /**
     * Can delete an endpoint
     */
    "delete",
    "checks:read",
    "checks:write",
  ];
};

type TeamId = string;
type ResourceId = string;
/**
 * Global Resource ID
 */
export type GRID = `${TeamId}::${keyof Resources | "*"}::${ResourceId}`;

export class Policy extends GenericPolicy<Resources, GRID> {}
