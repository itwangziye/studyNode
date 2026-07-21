import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";

@Injectable()
export class ArticleConsumer implements OnApplicationBootstrap {
    private readonly logger = new Logger(ArticleConsumer.name)
    constructor(private readonly rabbit: RabbitmqService) {}


    async onApplicationBootstrap() {
        const channel = this.rabbit.getChannel();
        await channel.assertExchange("article.events", "fanout", {durable: true});
        const q = await channel.assertQueue("article.notify.queue", {durable: true})
        await channel.bindQueue(q.queue, "article.events", "")
        channel.consume(q.queue, (message) => {
            if (!message) return;
            const row = message.content.toString();
            const data = JSON.parse(row);
            this.logger.log(`收到消息：${JSON.stringify(data)}`)
            channel.ack(message)
        })
    }
}