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
    this.scheduler = scheduler;
    this.kafka = new Kafka({
      brokers: [process.env.KAFKA_CLUSTER!],
      sasl: {
        mechanism: "scram-sha-256",
        username: process.env.KAFKA_USERNAME!,
        password: process.env.KAFKA_PASSWORD!,
      },
    });
  }

  async run(): Promise<void> {
    const c = this.kafka.consumer({ groupId: "default" });
    await c.connect();
    await c.subscribe({ topic: "endpoint.created" });
    await c.run({
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
