// ============================================================
// ElasticsearchModule —— 全局 ES 模块(对标 RedisModule/PrismaModule)
// @Global() 让所有模块都能注入 ElasticsearchService,不用每个模块都 import
// ============================================================
import { Global, Module } from "@nestjs/common"
import { ElasticsearchService } from "./elasticsearch.service"

@Global()
@Module({
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
