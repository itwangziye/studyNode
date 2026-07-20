import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ArticleService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService
    ) {}

    private getRandomTtl(base: number, jitter: number): number {
        return base + Math.floor(Math.random() * jitter)
    }


    async findAll(page: number = 1, pageSize: number = 10) {
        const cacheKey = `article:list:${page}:${pageSize}`

        const cachedData = await this.redis.get(cacheKey);

        if (cachedData) return JSON.parse(cachedData);


        const skip = (page - 1) * pageSize;
        const articles = await this.prisma.article.findMany({
            skip,
            take: pageSize,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        await this.redis.set(cacheKey, JSON.stringify(articles), this.getRandomTtl(60, 30))

        return articles
    }

    async findOne(id: number) {
        const cacheKey = `article:${id}`;
        const cachedData = await this.redis.get(cacheKey);
        if (cachedData) {
            if (cachedData === "null") return null
            await this.redis.zIncrBy("article:ranking", 1, String(id))
            return JSON.parse(cachedData)
        }
        const article = await this.prisma.article.findUnique({where: {id}, include: {author: {select: {id: true, name: true}}}})
        await this.redis.zIncrBy("article:ranking", 1, String(id))
        if (article) {
            await this.redis.set(cacheKey, JSON.stringify(article), this.getRandomTtl(60, 30))
        } else {
            await this.redis.set(cacheKey, "null", 30)
        }
        return article
    }

    async create(dto: CreateArticleDto, userId: number) {
        const article = await this.prisma.article.create({data: {title: dto.title, content: dto.content, authorId: userId}})
        await this.redis.delByPattern("article:list:*")
        return article
    }

    async remove(id:number, userId: number, role: string) {

        if (role !== "admin") {
            const article = await this.prisma.article.findUnique({where: {id}})
             if (!article) {
                throw new NotFoundException("文章不存在")
            }
            if (article?.authorId !== userId) {
                throw new ForbiddenException("只能删除自己的文章")
            }
        }

        const data = await this.prisma.article.deleteMany({where: {id}})
        await this.redis.del(`article:${id}`)

        if (data.count > 0) {
            return true
        }
        return false
    }

    async update(id: number, dot: CreateArticleDto, userId: number) {
        const article = await this.prisma.article.findUnique({where: {id}});
        if (article?.authorId !== userId) {
             throw new ForbiddenException("只能编辑自己的文章")
        }
        const articleFlag = await this.prisma.article.update({where: {id}, data: {...dot}})
        await this.redis.del(`article:${id}`)
        return articleFlag
    }

    async getRanking(topN: number) {
        const rank = await this.redis.zRevRange("article:ranking", 0, topN - 1)
        const target: {articleId: number, score: number}[] = [];
        for (let i = 0; i < rank.length; i+=2) {
            const articleId = Number(rank[i]);
            const score = Number(rank[i+1])
            target.push({articleId, score})
        }
        return target
    }
}