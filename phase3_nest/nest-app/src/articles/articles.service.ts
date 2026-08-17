import { ConflictException, ForbiddenException, HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { CreateArticleDto, UpdateArticleDto} from "./dto/create-article.dto";
import { PrismaService } from "../prisma/prisma.service";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { KafkaService } from "../kafka/kafka.service";
import { BatchCreateArticleDto } from "./dto/batch-create-article.dto";
import { Article } from "../generated/prisma/client";
import { RequestContextService } from "../common/context/request-context.service";
import { LoggerService } from "../common/logger/logger.service";

@Injectable()
export class ArticleService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly rabbit: RabbitmqService,
        private readonly kafka: KafkaService,
        private readonly requestContext: RequestContextService,
        private readonly logger: LoggerService
    ) {}

    private getRandomTtl(base: number, jitter: number): number {
        return base + Math.floor(Math.random() * jitter)
    }


    async findAll(page: number = 1, pageSize: number = 10) {
        const cacheKey = `article:list:${page}:${pageSize}`

        const cachedData = await this.redis.get(cacheKey);

        if (cachedData) {
            this.logger.info('文章列表-缓存命中', { page, pageSize })
            return JSON.parse(cachedData);
        }


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
        this.logger.info('文章列表-DB查询', { page, pageSize, count: articles.length })

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
        const article = await this.prisma.article.findUnique({
            where: {id}, 
            include: {
                author: {
                    select: {id: true, name: true}
                },
                comments: {
                    select: {
                        content: true,
                        user: {
                            select: {id: true, name: true}
                        }
                    }
                }
            }
        })
        await this.redis.zIncrBy("article:ranking", 1, String(id))
        if (article) {
            await this.redis.set(cacheKey, JSON.stringify(article), this.getRandomTtl(60, 30))
            await this.kafka.getProducer().send({
                topic: "article-views",
                messages: [{value: JSON.stringify({articleId: id, timestamp: Date.now()})}]
            })
        } else {
            await this.redis.set(cacheKey, "null", 30)
        }
        return article
    }

    async create(dto: CreateArticleDto, userId: number, idemKey?: string) {
        const casheKey = `idem:${idemKey}`;
        const lockKey = `idem:lock:${idemKey}`;
        if (idemKey) {
            let cachedData = await this.redis.get(casheKey);
            if (cachedData) return JSON.parse(cachedData);
            const lockToken = crypto.randomUUID();
            const lock = await this.redis.setNx(lockKey, lockToken, 10);
            if (lock) {
                const watchDog = setInterval(() => {
                    this.redis.renewLock(lockKey, lockToken, 10)
                }, 3000)
                try {
                    const cached = await this.redis.get(casheKey)
                    if (cached) return JSON.parse(cached)

                    const article = await this.prisma.article.create({data: {title: dto.title, content: dto.content, authorId: userId}})
                    await this.redis.set(`idem:${idemKey}`, JSON.stringify(article), 86400)

                    await this.redis.delByPattern("article:list:*")

                    const channel = this.rabbit.getChannel();
                    channel.assertExchange("article.events", "fanout", {durable: true});
                    const articleBuffer = Buffer.from(JSON.stringify({articleId: article.id, title: article.title, content: article.content, authorId: article.authorId}))
                    channel.publish("article.events", "", articleBuffer)
                    return article
                } finally {
                    clearInterval(watchDog)
                    this.redis.unlock(lockKey, lockToken)
                }
            } else {
                const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
                for (let i = 0; i < 30; i++) {
                    await sleep(50)                          // 等 50ms
                    const cached = await this.redis.get(casheKey)  // 重新查缓存
                    if (cached) return JSON.parse(cached)
                }
                throw new HttpException("请求繁忙，请稍后再试", 429)
            }

        }

        const article = await this.prisma.article.create({data: {title: dto.title, content: dto.content, authorId: userId}})

        await this.redis.delByPattern("article:list:*")

        const channel = this.rabbit.getChannel();
        channel.assertExchange("article.events", "fanout", {durable: true});
        const articleBuffer = Buffer.from(JSON.stringify({articleId: article.id, title: article.title, content: article.content, authorId: article.authorId}))
        channel.publish("article.events", "", articleBuffer)

        return article
    }

    async batchCreate(dto: BatchCreateArticleDto, userId: number) {
        const result = await this.prisma.$transaction( async (tx) => {
            const createdArticle: Article[] = [];
            for (const article of dto.articles) {
                const item = await tx.article.create({
                    data: {title: article.title, content: article.content, authorId: userId}
                })
                createdArticle.push(item)
            }
            return createdArticle
        })
        await this.redis.delByPattern("article:list:*")
        return result
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
        await this.redis.delByPattern("article:list:*")

        if (data.count > 0) {
            return true
        }
        return false
    }

    async update(id: number, dot: UpdateArticleDto, userId: number) {
        const article = await this.prisma.article.findUnique({where: {id}});
        if (article?.authorId !== userId) {
             throw new ForbiddenException("只能编辑自己的文章")
        }
        const {count} = await this.prisma.article.updateMany({
            where: {id, version: dot.version}, 
            data: {
                title: dot.title,
                content: dot.content,
                version: { increment: 1 }
            }
        })
        if (count === 0) throw new ConflictException("文章已被他人修改,请刷新后重试")
        await this.redis.del(`article:${id}`)
        await this.redis.delByPattern("article:list:*")
        const updated = await this.prisma.article.findUnique({ where: { id } })        
        return updated
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