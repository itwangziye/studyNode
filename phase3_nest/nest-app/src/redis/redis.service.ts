// ============================================================
// RedisService —— 全局 Redis 缓存服务(对标 PrismaService)
// 封装 ioredis,通过 IoC 全局共享单例
// 业务代码只跟这个 Service 打交道,不直接碰 ioredis
// ============================================================
import { Injectable, OnModuleDestroy } from "@nestjs/common"
import { Redis } from "ioredis"

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis

  constructor() {
    // 从环境变量读 Redis 地址,没有就用本地默认
    this.client = new Redis({
      host: process.env.REDIS_HOST ?? "localhost",
      port: Number(process.env.REDIS_PORT ?? 6379),
    })
  }

  // 模块销毁时断开连接(跟 PrismaService.onModuleDestroy 同理)
  async onModuleDestroy() {
    await this.client.quit()
  }

  // 下面封装几个业务常用的方法,屏蔽 ioredis 的细节
  // 你写 findAll 缓存时会用到 get / set 这两个

  async get(key: string): Promise<string | null> {
    return await this.client.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      // EX = 设置过期时间(秒),这就是你说的「设置缓存过期时间」
      await this.client.set(key, value, "EX", ttlSeconds)
    } else {
      await this.client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  // ============================================================
  // 分布式锁相关:用于缓存击穿防护(关 23)
  // ============================================================

  // 抢锁:SET key value NX EX seconds
  // NX = 只在 key 不存在时才能设置成功(抢锁核心)
  // EX = 过期时间(秒),防止拿到锁的人挂了导致死锁
  // 返回 "OK" = 抢到了,null = 有人已经拿着锁了
  async setNx(key: string, value: string, ttlSeconds: number): Promise<string | null> {
    return await this.client.set(key, value, "EX", ttlSeconds, "NX")
  }

  // 释放锁:删掉 key
  async delOk(key: string): Promise<void> {
    await this.client.del(key)
  }

  // ============================================================
  // 滑动窗口限流相关(关 24):基于 Sorted Set
  // ============================================================

  // 删除分数(时间戳)在 min ~ max 之间的成员
  // 用来清掉窗口外的旧请求
  async zRemRangeByScore(key: string, min: number, max: number): Promise<number> {
    return await this.client.zremrangebyscore(key, min, max)
  }

  // 数当前 key 里有多少个成员
  // 用来统计窗口内的请求数量
  async zCard(key: string): Promise<number> {
    return await this.client.zcard(key)
  }

  // 添加成员:member 用唯一标识,score 用时间戳
  async zAdd(key: string, score: number, member: string): Promise<number> {
    return await this.client.zadd(key, score, member)
  }

  // 给限流 key 设过期时间(窗口结束后自动清理整个 key,省内存)
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds)
  }

  // ============================================================
  // 排行榜相关(关 25):Sorted Set 经典用法
  // ============================================================

  // 给某个 member 增加分数(完成一个任务 +1)
  // ZINCRBY key increment member
  // 返回的是字符串(如 "50"),需要用时自己转 number
  async zIncrBy(key: string, increment: number, member: string): Promise<string> {
    return await this.client.zincrby(key, increment, member)
  }

  // 按分数从高到低,取 Top N(排行榜核心)
  // ZREVRANGE key start stop WITHSCORES
  // 返回扁平数组: ["1", "50", "2", "30", ...]  ← 偶数位=userId, 奇数位=score
  async zRevRange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.zrevrange(key, start, stop, "WITHSCORES")
  }
}
