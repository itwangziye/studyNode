import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { CreateCommentDto } from "./dto/create-comment";

@Injectable()
export class CommentService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService
    ) {}

    private getRandomTtl(base: number, jitter: number): number {
        return base + Math.floor(Math.random() * jitter)
    }

    async findByArticleId(articleId: number) {
        const cacheKey = `comment:${articleId}`;
        const casheData = await this.redis.get(cacheKey);
        if (casheData) return JSON.parse(casheData)
        const comments = await this.prisma.comment.findMany({
            where: {articleId},
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {createdAt: "desc"}
        })

        this.redis.set(cacheKey, JSON.stringify(comments), this.getRandomTtl(30, 60))
        return comments
    }

    async create(dot: CreateCommentDto, articleId: number, userId: number) {
        const article = await this.prisma.article.findUnique({where: {id: articleId}})
        if (!article) throw new NotFoundException("文章不存在")
        const comment = await this.prisma.comment.create({data: {
            ...dot,
            articleId,
            userId
        }})
        await this.redis.del(`comment:${comment.articleId}`)
        return comment
    }

    async remove(id: number, userId: number, role: string) {
        const comment = await this.prisma.comment.findUnique({where: {id}})
        if (!comment) throw new NotFoundException("评论并不存在")
        if (role !== "admin") {
            if (comment.userId !== userId) {
                throw new ForbiddenException("没有权限删除")
            }
        }
        const success = await this.prisma.comment.deleteMany({where: {id}})
        await this.redis.del(`comment:${comment.articleId}`)
        if (success.count > 0) return true
        return false
    }
}