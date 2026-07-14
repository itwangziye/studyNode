import { Injectable, CanActivate, ExecutionContext, HttpException } from "@nestjs/common";
import { RedisService } from "../../redis/redis.service";

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  private readonly WINDOW = 60       // 窗口大小(秒)
  private readonly MAX = 10          // 最大请求数

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    // ① 拿到 IP(提示:用 request.ip,记得处理 ::ffff: 前缀)
    const ip = request.ip;
    // ② 造 key:rate_limit:{ip}
    const key = `rate_limit:${ip}`
    // ③ 算时间:当前时间戳 now、窗口起点 windowStart
    const now = Date.now()
    const windowStart = now - this.WINDOW * 1000   // 窗口起点
    // ④ 清掉窗口外的旧请求(用 zRemRangeByScore)
    await this.redis.zRemRangeByScore(key, 0, windowStart)
    // ⑤ 数当前窗口内有多少个请求(用 zCard)
    const count = await this.redis.zCard(key)
    // ⑥ 判断:超过上限 → 抛 429
    if (count >= this.MAX) {
        throw new HttpException("请求过于频繁,请稍后再试", 429)
    }
    // ⑦ 没超 → 记录这次请求(用 zAdd)
    await this.redis.zAdd(key, now, `${now}`)
    // ⑧ 给 key 设过期时间(用 expire)
    await this.redis.expire(key, this.WINDOW)
    return true
  }
}