// ============================================================
// RedisModule —— 全局共享 RedisService(对标 PrismaModule)
// @Global() 让所有模块都能注入 RedisService
// ============================================================
import { Global, Module } from "@nestjs/common"
import { RedisService } from "./redis.service"

@Global()                                    // ← 跟 PrismaModule 一样,全局可见
@Module({
  providers: [RedisService],
  exports: [RedisService],                   // ← 导出,别的模块才能注入
})
export class RedisModule {}
