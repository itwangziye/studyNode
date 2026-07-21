import { Module } from "@nestjs/common";
import { ArticlesController } from "./articles.controller";
import { ArticleService } from "./articles.service";
import { ArticleConsumer } from "./articles.consumer";
import { ArticleViewConsumer } from "./article-view.consumer";

@Module({
    controllers: [ArticlesController],
    providers: [ArticleService, ArticleConsumer, ArticleViewConsumer]
})

export class ArticlesModule {}