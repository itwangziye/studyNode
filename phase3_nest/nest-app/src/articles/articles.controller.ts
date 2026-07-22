import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ArticleService } from './articles.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateArticleDto } from "./dto/create-article.dto";
import { ThrottleGuard } from "../common/guards/throttle.guard";

@ApiTags("文章")
@ApiBearerAuth()
@Controller("articles")
export class ArticlesController {
    constructor(private readonly articleService: ArticleService) {}
    

    @Get()
    @ApiOperation({summary: "文章列表(?page=1&pageSize=10)"})
    async findAll(@Query("page") page?: string, @Query("pageSize") pageSize?: string) {
        const data = await this.articleService.findAll(page ? Number(page): 1, pageSize? Number(pageSize): 10)
        return data
    }

    @Get("ranking")
    async getRanking(@Query("topN") topN?: string) {
        return await this.articleService.getRanking(topN? Number(topN): 10)
    }

    @Get(':id')
    @ApiOperation({summary: "文章详情"})
    async findOne(@Param("id", ParseIntPipe) id: number) {
        const article = await this.articleService.findOne(id);
        if (!article) throw new NotFoundException("文章不存在")
        return article
    }

    @Post()
    @UseGuards(JwtAuthGuard, ThrottleGuard)
    async create(@Body() dot: CreateArticleDto, @CurrentUser() user) {
        const article = await this.articleService.create(dot, user.userId)
        return article
    }

    @Put(":id")
    @UseGuards(JwtAuthGuard)
    async update(@Param("id", ParseIntPipe) id: number, @Body() dot: CreateArticleDto, @CurrentUser() user) {
        const article = await this.articleService.update(id, dot, user.userId)
        return article
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    async delete(@Param("id", ParseIntPipe) id: number, @CurrentUser() user) {
        const flag = await this.articleService.remove(id, user.userId, user.role)
        return flag
    }

    

}