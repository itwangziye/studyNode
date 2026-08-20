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

  // 按模式删除多个 key(如 "article:list:*" 删所有列表缓存)
  // Redis 的 del 不支持通配符,需要先 keys 再批量删
  // ⚠️ 生产环境 keys 命令在大数据量时很慢,仅限缓存清理场景
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern)
    if (keys.length > 0) {
      await this.client.del(keys)
    }
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

  // 释放锁:删掉 key(不校验归属,简单场景用)
  async delOk(key: string): Promise<void> {
    await this.client.del(key)
  }

  // ============================================================
  // 分布式锁续期 / 解锁(关 52):锁归属校验 + Lua 原子操作
  // ============================================================
  // 问题:setNx 抢锁时 value 如果是固定 "1",那锁没有"主人"。
  //   锁一旦过期被别人抢走(写入他的 value),你的看门狗 expire / finally delOk
  //   会误操作【别人的锁】——续了别人的命、删了别人的锁。
  // 解法:value 存唯一 token(锁的身份证)。续期/删除前先校验"这锁还是我的 token"。
  //   而【校验 + 操作】必须用 Lua 脚本原子执行——否则两步之间锁可能易主:
  //     get 比对成功(还是我的) → 此刻锁恰好过期 → 别人 setNx 抢到 → 我的 expire/del 落到别人的锁上
  //   这和 SET NX 一个道理:多步操作必须焊成原子,消除竞态窗口。
  private static readonly RENEW_LOCK_SCRIPT = `
    if redis.call('get', KEYS[1]) == ARGV[1] then
      return redis.call('expire', KEYS[1], ARGV[2])
    else
      return 0
    end
  `
  private static readonly UNLOCK_SCRIPT = `
    if redis.call('get', KEYS[1]) == ARGV[1] then
      return redis.call('del', KEYS[1])
    else
      return 0
    end
  `

  // 原子续期(看门狗用):锁的 value 还是 token 才 expire
  // 返回 1=续上了;0=锁已易主(过期被别人抢),不再续——别把别人的锁续了命
  async renewLock(key: string, token: string, ttlSeconds: number): Promise<number> {
    return (await this.client.eval(RedisService.RENEW_LOCK_SCRIPT, 1, key, token, ttlSeconds)) as number  
  }

  // 原子解锁:锁的 value 还是 token 才 del(防止删别人的锁)
  // 返回 1=删了;0=锁已易主,不删
  async unlock(key: string, token: string): Promise<number> {
    return (await this.client.eval(RedisService.UNLOCK_SCRIPT, 1, key, token)) as number
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

  async ping() {
    return await this.client.ping()
  }
}
