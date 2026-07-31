import { Module } from "@nestjs/common";
import { ArticlesController } from "./articles.controller";
import { ArticleService } from "./articles.service";
import { ArticleConsumer } from "./articles.consumer";
import { ArticleViewConsumer } from "./article-view.consumer";
import { ArticleSearchService } from "./article-search.service";
import { ArticleSearchConsumer } from "./article-search-consumer";

@Module({
    controllers: [ArticlesController],
    providers: [ArticleService, ArticleConsumer, ArticleViewConsumer, ArticleSearchService, ArticleSearchConsumer],
    exports: [ArticleSearchService]
})

export class ArticlesModule {}