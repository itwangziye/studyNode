import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";

@Injectable()
export class SmsConsumer implements OnApplicationBootstrap {
    private readonly logger  = new Logger(SmsConsumer.name)
    constructor(private readonly rabbitmq: RabbitmqService) {}

    async onApplicationBootstrap() {
        const channel = this.rabbitmq.getChannel();
        await channel.assertExchange("task.events", "fanout", {durable: true})
        const q = await channel.assertQueue("sms_queue", {durable: true})
        await channel.bindQueue(q.queue, "task.events", "")
        await channel.consume(q.queue, (message) => {
           if(!message) return
           const row = message.content.toString();
           const data = JSON.parse(row);
           this.logger.log(`sms收到消息: ${JSON.stringify(data)}`)
           channel.ack(message)
        })
    }
}