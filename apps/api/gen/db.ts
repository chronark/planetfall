import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | null | number | string;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export interface _AlertToEmailChannel {
  A: string;
  B: string;
}

export interface _AlertToEndpoint {
  A: string;
  B: string;
}

export interface _AlertToSlackChannel {
  A: string;
  B: string;
}

export interface _EndpointToRegion {
  A: string;
  B: string;
}

export interface _EndpointToStatusPage {
  A: string;
  B: string;
}

export interface Account {
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
}

export interface Alert {
  id: string;
  teamId: string;
  addNewEndpointsAutomatically: number;
  active: number;
}

export interface ApiKey {
  id: string;
  createdAt: Generated<Date>;
  updatedAt: Date;
  teamId: string;
  name: string;
  keyHash: string;
  firstCharacters: string;
  policy: string;
}

export interface EmailChannel {
  id: string;
  email: string;
  active: number;
  teamId: string;
}

export interface Endpoint {
  id: string;
  method: "DELETE" | "GET" | "OPTIONS" | "PATCH" | "POST" | "PUT";
  name: string;
  teamId: string;
  url: string;
  createdAt: Generated<Date>;
  updatedAt: Date;
  interval: number;
  active: number;
  degradedAfter: number | null;
  timeout: number | null;
  distribution: "ALL" | "RANDOM";
  headers: Json | null;
  body: string | null;
  assertions: string | null;
  ownerId: string | null;
  followRedirects: number;
  deletedAt: Date | null;
  prewarm: Generated<number | null>;
  runs: Generated<number | null>;
}

export interface EndpointAuditLog {
  id: string;
  endpointId: string;
  userId: string | null;
  message: string;
  time: Generated<Date>;
}

export interface Membership {
  createdAt: Generated<Date>;
  updatedAt: Date;
  userId: string;
  teamId: string;
  role: "ADMIN" | "MEMBER" | "OWNER";
}

export interface Region {
  id: string;
  name: string;
  platform: "aws" | "fly" | "flyRedis" | "vercel" | "vercelEdge";
  region: string;
  url: string;
  visible: number;
  custom: string | null;
  lat: number | null;
  lon: number | null;
}

export interface Session {
  userId: string;
  expires: Date;
  sessionToken: string;
}

export interface Setup {
  id: string;
  endpointId: string;
  url: string;
  headers: Json | null;
  ttl: number;
}

export interface SlackChannel {
  id: string;
  url: string;
  active: number;
  teamId: string;
}

export interface StatusPage {
  id: string;
  slug: string;
  name: string;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  createdAt: Generated<Date>;
  updatedAt: Date;
  plan: "DISABLED" | "ENTERPRISE" | "FREE" | "PRO";
  stripeCustomerId: string | null;
  maxMonthlyRequests: number;
  maxEndpoints: number;
  maxTimeout: number;
  deactivatedAt: Date | null;
  includedRequests: number | null;
  trialExpires: Date | null;
  maxPages: number;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  createdAt: Generated<Date>;
  expires: Date;
  userId: string | null;
}

export interface Token {
  userId: string;
  expires: Date | null;
  permissions: string;
  name: string;
  hash: string;
  createdAt: Generated<Date>;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Generated<Date>;
}

export interface VerificationRequest {
  identifier: string;
  otp: string;
  expires: Date;
  createdAt: Generated<Date>;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface DB {
  _AlertToEmailChannel: _AlertToEmailChannel;
  _AlertToEndpoint: _AlertToEndpoint;
  _AlertToSlackChannel: _AlertToSlackChannel;
  _EndpointToRegion: _EndpointToRegion;
  _EndpointToStatusPage: _EndpointToStatusPage;
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
}
