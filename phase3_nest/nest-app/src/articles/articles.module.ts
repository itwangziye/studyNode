import { Module } from "@nestjs/common";
import { ArticlesController } from "./articles.controller";
import { ArticleService } from "./articles.service";

@Module({
    controllers: [ArticlesController],
    providers: [ArticleService]
})

export class ArticlesModule {}