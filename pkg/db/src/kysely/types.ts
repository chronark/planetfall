import type { ColumnType, GeneratedAlways } from 'kysely';
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
} as const;
export type Method = (typeof Method)[keyof typeof Method];
export const MemberRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];
export const Plan = {
  DISABLED: 'DISABLED',
  FREE: 'FREE',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const;
export type Plan = (typeof Plan)[keyof typeof Plan];
export const Platform = {
  vercel: 'vercel',
  vercelEdge: 'vercelEdge',
  aws: 'aws',
  flyRedis: 'flyRedis',
  fly: 'fly',
} as const;
export type Platform = (typeof Platform)[keyof typeof Platform];
export const Distribution = {
  RANDOM: 'RANDOM',
  ALL: 'ALL',
} as const;
export type Distribution = (typeof Distribution)[keyof typeof Distribution];
export type Account = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};
export type Alert = {
  id: string;
  teamId: string;
  active: number;
  addNewEndpointsAutomatically: number;
};
export type ApiKey = {
  id: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  teamId: string;
  name: string;
  keyHash: string;
  firstCharacters: string;
  policy: string;
};
export type EmailChannel = {
  id: string;
  teamId: string;
  email: string;
  active: number;
};
export type Endpoint = {
  id: string;
  method: Method;
  name: string;
  teamId: string;
  url: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
  followRedirects: number;
  prewarm: Generated<number | null>;
  runs: Generated<number | null>;
  ownerId: string | null;
  interval: number;
  active: number;
  degradedAfter: number | null;
  timeout: number | null;
  distribution: Distribution;
  headers: unknown | null;
  body: string | null;
  assertions: string | null;
};
export type EndpointAuditLog = {
  id: string;
  endpointId: string;
  userId: string | null;
  message: string;
  time: Generated<Timestamp>;
};
export type Membership = {
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  userId: string;
  teamId: string;
  role: MemberRole;
};
export type Region = {
  id: string;
  name: string;
  platform: Platform;
  region: string;
  url: string;
  visible: number;
  custom: string | null;
  lat: number | null;
  lon: number | null;
};
export type Session = {
  sessionToken: string;
  userId: string;
  expires: Timestamp;
};
export type Setup = {
  id: string;
  endpointId: string;
  url: string;
  headers: unknown | null;
  ttl: number;
};
export type SlackChannel = {
  id: string;
  teamId: string;
  url: string;
  active: number;
};
export type StatusPage = {
  id: string;
  slug: string;
  name: string;
  teamId: string;
};
export type Team = {
  id: string;
  name: string;
  slug: string;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  plan: Plan;
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  trialExpires: Timestamp | null;
  deactivatedAt: Timestamp | null;
  maxMonthlyRequests: number;
  maxEndpoints: number;
  maxPages: number;
  maxTimeout: number;
  includedRequests: number | null;
};
export type TeamInvitation = {
  id: string;
  teamId: string;
  createdAt: Generated<Timestamp>;
  expires: Timestamp;
  userId: string | null;
};
export type Token = {
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  name: string;
  hash: string;
  userId: string;
  expires: Timestamp | null;
  permissions: string;
};
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: Timestamp | null;
  image: string | null;
  createdAt: Generated<Timestamp>;
};
export type VerificationRequest = {
  identifier: string;
  otp: string;
  expires: Timestamp;
  createdAt: Generated<Timestamp>;
};
export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Timestamp;
};
export type DB = {
  Account: Account;
  Alert: Alert;
  ApiKey: ApiKey;
  EmailChannel: EmailChannel;
  Endpoint: Endpoint;
  EndpointAuditLog: EndpointAuditLog;
  Membership: Membership;
  Region: Region;
  Session: Session;
  Setup: Setup;
  SlackChannel: SlackChannel;
  StatusPage: StatusPage;
  Team: Team;
  TeamInvitation: TeamInvitation;
  Token: Token;
  User: User;
  VerificationRequest: VerificationRequest;
  VerificationToken: VerificationToken;
};
