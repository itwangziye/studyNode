import { Injectable, HttpException} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"
import { RedisService } from "../redis/redis.service";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";


@Injectable()
export class TasksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly rabbit: RabbitmqService
    ) {}
    private readonly CACHE_KEY = "task:all"
    private readonly CACHE_RANK_KEY ="task:ranking"

    private getRandomTtl(base: number, jitter: number): number {
        return base + Math.floor(Math.random() * jitter)
    }

                
    async findAll() {
        const cachedData = await this.redis.get(this.CACHE_KEY);
        if (cachedData) return JSON.parse(cachedData);
        const data =  await this.prisma.task.findMany();
        this.redis.set(this.CACHE_KEY, JSON.stringify(data), this.getRandomTtl(60, 30))
        return data
    }
    async findOne(id: number) {
        const key = `task:${id}`;
        const lockKey = `task:lock:${id}`

        const cachedData = await this.redis.get(key);
        if (cachedData) {
            if (cachedData === "null") return null
            return JSON.parse(cachedData)
        }
        const lock = await this.redis.setNx(lockKey, "1", 3)
        if (lock) {
            try {
                const data = await this.prisma.task.findUnique({where: {id}})
                if (data) {
                    this.redis.set(key, JSON.stringify(data), this.getRandomTtl(60, 30))
                } else {
                    this.redis.set(key, "null", 30)
                }
                return data
            } finally {
                await this.redis.delOk(lockKey)
            }
        } else {
            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
            for (let i = 0; i < 30; i++) {
                await sleep(50)                          // 等 50ms
                const cached = await this.redis.get(key)  // 重新查缓存
                if (cached) {
                    return cached === "null" ? null : JSON.parse(cached)
                }
            }
            throw new HttpException("请求繁忙，请稍后再试", 429)
        }
    }
    async create(title: string, userId: number) {
        const task = await this.prisma.task.create({data: {title, userId}})
        const channel = this.rabbit.getChannel();
        channel.assertExchange("task.events", "fanout", {durable: true})  // 声明 fanout 交换机
        const taskBuffter = Buffer.from(JSON.stringify({taskId: task.id, title: task.title, userId}));
        channel.publish("task.events", "", taskBuffter)
        return task
    }
    async remove(id: number) {
        const {count} = await this.prisma.task.deleteMany({ where: { id } })
        return count> 0
    }
     async completeTask(id: number, userId: number) {
        // 提示:
        // 1. 更新数据库(把 task 的 done 改成 true)
        // 2. Redis 排行榜加分:zIncrBy(排行榜key, 1, userId)
        // 排行榜 key 设计:task:ranking
        const task = await this.prisma.task.update({where: {id}, data: {done: true}})
        await this.redis.zIncrBy(this.CACHE_RANK_KEY, 1, String(userId))
        return task

    }
    async getRanking(topN: number = 10) {
        // 提示:
        // 1. zRevRange(排行榜key, 0, topN - 1)
        //    返回 [["1", "50"], ["2", "30"], ...]  ← [userId, 分数]
        // 2. 整理成可读格式返回,比如:
        //    [{ userId: "1", score: "50" }, { userId: "2", score: "30" }]
        const rank = await this.redis.zRevRange(this.CACHE_RANK_KEY, 0, topN -1);
        const target: {userId: number, score: number}[] = [];
        for (let i = 0; i < rank.length; i+=2) {
            const userId = Number(rank[i]);
            const score = Number(rank[i+1])
            target.push({userId, score})
        }
        return target
    }
}