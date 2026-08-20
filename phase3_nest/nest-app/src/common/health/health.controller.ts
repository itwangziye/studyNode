import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { RedisService } from '../../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';

@Controller()
export class HealthController {
    constructor(
        private readonly redis: RedisService,
        private readonly prisma: PrismaService,
    ) {}

    @Get("/health")
    async getHealth() {
        
        const withTimeout = (p: Promise<unknown>, ms = 1000) =>
        Promise.race([p, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])

        const dbPromise = withTimeout(this.prisma.$queryRaw`SELECT 1`)
        const redisPromise = withTimeout(this.redis.ping())
        const results = await Promise.allSettled([dbPromise, redisPromise])

        const database = results[0].status === 'fulfilled' ? 'up' : 'down';
        const redis = results[1].status === 'fulfilled' ? 'up' : 'down'

        const healthy = database === "up" && redis === "up"

       

        if (!healthy) {
            // ② 503 的内置异常类(命名规律给过了),message 里带上 checks——
            //    让运维 curl 一眼看出哪个依赖挂了
            throw new ServiceUnavailableException(`checks——database:${database} redis:${redis}`)
        }

        return {status: "ok", checks: { database, redis }}
    }

    @Get("/slow")
    async getSlow() {
        await new Promise(r => setTimeout(r, 3000))
        return {slow: true}
    }
}