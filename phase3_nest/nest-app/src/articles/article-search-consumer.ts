import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { ArticleSearchService } from './article-search.service';

@Injectable()
export class ArticleSearchConsumer implements OnApplicationBootstrap {
    private readonly logger = new Logger(ArticleSearchConsumer.name)
    constructor(
        private readonly rabbit: RabbitmqService,
        private readonly articleSearchService: ArticleSearchService
    ) {}


    async onApplicationBootstrap() {
        const channel = this.rabbit.getChannel();
        await channel.assertExchange("article.events", "fanout", {durable: true});
        const q = await channel.assertQueue("article.search.queue", {durable: true})
        await channel.bindQueue(q.queue, "article.events", "")
        channel.consume(q.queue, async(message) => {
            if (!message) return;
            try {
                const row = message.content.toString();
                const data = JSON.parse(row);
                this.logger.log(`已同步文章到 ES:${JSON.stringify(data)}`)
                await this.articleSearchService.indexArticle({id: data.articleId, title: data.title, content: data.content, authorId: data.authorId})
            } catch (error) {
                this.logger.error("同步ES失败", JSON.stringify(error))
            } finally {
                channel.ack(message)
            }
        })
    }
}