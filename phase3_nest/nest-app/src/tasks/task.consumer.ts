import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";

@Injectable()
export class TaskConsumer implements OnApplicationBootstrap {
    private readonly logger  = new Logger(TaskConsumer.name)
    constructor(private readonly rabbitmq: RabbitmqService) {}

    async onApplicationBootstrap() {
        // ① 拿 channel
        // ② 确保 "task.created" 队列存在(assertQueue)
        // ③ consume 监听:收到消息 → JSON.parse → logger.log → ack

        const channel = this.rabbitmq.getChannel();
        await channel.assertExchange("task.events", "fanout", {durable: true})
        const q = await channel.assertQueue("email_queue", {durable: true})
        await channel.bindQueue(q.queue, "task.events", "")

        await channel.consume(q.queue, (message) => {
           if(!message) return
           const row = message.content.toString();
           const data = JSON.parse(row);
           this.logger.log(`收到消息: ${JSON.stringify(data)}`)
           channel.ack(message)
        })
    }
}