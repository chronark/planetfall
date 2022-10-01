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
    const broker = process.env.KAFKA_BROKER
    if (!broker) {
      throw new Error("KAFKA_BROKER is not defined")
    }
    const username = process.env.KAFKA_USERNAME
    if (!username) {
      throw new Error("KAFKA_USERNAME is not defined")
    }

    const password = process.env.KAFKA_PASSWORD
    if (!password) {
      throw new Error("KAFKA_PASSWORD is not defined")
    }



    this.scheduler = scheduler;
    this.kafka = new Kafka({
      brokers: [broker],
      sasl: {
        mechanism: 'scram-sha-256',
        username,
        password,
      },
    });
  }

  async run(): Promise<void> {
    const c = this.kafka.consumer({ groupId: "default" });
    await c.connect().catch(err => {
      throw new Error(`unable to connect to kafka: ${(err as Error).message}`)
    })
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
