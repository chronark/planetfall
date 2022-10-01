import { Kafka } from "kafkajs";
import { Scheduler } from "./scheduler";
import { z } from "zod";

const validation = z.object({
  endpointId: z.string(),
});

export class Events {
  private scheduler: Scheduler;
  private kafka: Kafka;

  constructor(scheduler: Scheduler) {
    // const broker = process.env.KAFKA_BROKER
    // if (!broker) {
    //   throw new Error("KAFKA_BROKER is not defined")
    // }
    // const username = process.env.KAFKA_USERNAME
    // if (!username) {
    //   throw new Error("KAFKA_USERNAME is not defined")
    // }

    // const password = process.env.KAFKA_PASSWORD
    // if (!password) {
    //   throw new Error("KAFKA_PASSWORD is not defined")
    // }

    this.scheduler = scheduler;

    this.kafka = new Kafka({
      brokers: ["guided-mayfly-5226-eu1-kafka.upstash.io:9092"],
      sasl: {
        mechanism: "scram-sha-256",
        username:
          "Z3VpZGVkLW1heWZseS01MjI2JFR6xU2xMP72Fah6nc6tJmrvjjY_4liyvXx60z4",
        password:
          "LS05fUMzOT6MD4L1n3kwRkOrAsQu-B_gtY11dLz6pNepoTORnU5Wvu5UhiDc1CEpFTi8sQ==",
      },
      ssl: true,
    });
  }

  async run(): Promise<void> {
    const c = this.kafka.consumer({ groupId: "default" });
    await c.connect().catch((err) => {
      throw new Error(`unable to connect to kafka: ${(err as Error).message}`);
    });
    await c.subscribe({ topic: "endpoint.created", fromBeginning: false });
    await c.run({
      autoCommit: true,
      eachMessage: async ({ topic, message }) => {
        const { endpointId } = validation.parse(
          JSON.parse(message.value!.toString()),
        );
        switch (topic) {
          case "endpoint.created":
            await this.scheduler.addEndpoint(endpointId);
            break;
          case "endpoint.updated":
            await this.scheduler.addEndpoint(endpointId);
            break;
          case "endpoint.deleted":
            this.scheduler.removeEndpoint(endpointId);
            break;
          default:
            throw new Error(`unknown topic: ${topic}`);
        }
      },
    });
  }
}
