import { Kafka } from "@upstash/kafka";

const url = process.env.UPSTASH_KAFKA_REST_URL;
if (!url) {
  throw new Error("UPSTASH_KAFKA_REST_URL is undefined");
}
const username = process.env.UPSTASH_KAFKA_REST_USERNAME;
if (!username) {
  throw new Error("UPSTASH_KAFKA_REST_USERNAME is undefined");
}
const password = process.env.UPSTASH_KAFKA_REST_PASSWORD;
if (!password) {
  throw new Error("UPSTASH_KAFKA_REST_PASSWORD is undefined");
}
export const kafka = new Kafka({
  url,
  username,
  password,
});
