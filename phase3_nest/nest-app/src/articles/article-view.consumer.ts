import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { KafkaService } from "../kafka/kafka.service";

@Injectable()
export class ArticleViewConsumer implements OnApplicationBootstrap {
    constructor(private readonly kafka: KafkaService) {}
    private readonly logger = new Logger(ArticleViewConsumer.name)

    async onApplicationBootstrap() {
        const consumer = this.kafka.getKafka().consumer({groupId: "view-log-group"});
        await consumer.connect()
        await consumer.subscribe({
            topic: "article-views",
            fromBeginning: true
        })
        await consumer.run({
            eachMessage: async ({message}) => {
                const str = message.value?.toString();
                const data = str ? JSON.parse(str) : null;
                this.logger.log(`Kafka 收到消息：${JSON.stringify(data)}`)
            }
        })

    }
}