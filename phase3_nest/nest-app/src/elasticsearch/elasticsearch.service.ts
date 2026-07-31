// ============================================================
// ElasticsearchService —— 全局 ES 搜索服务(对标 RedisService/PrismaService)
// 封装 @elastic/elasticsearch 官方客户端,通过 IoC 全局共享单例
// 业务代码只跟这个 Service 打交道,不直接碰底层 client
//
// 为什么单独建一个 Service(而不是业务里直接 new Client)?
//   1. 统一管理连接(单例,避免重复建连接)
//   2. 统一错误处理 + 日志
//   3. 换库/改配置时只改这里,业务无感(依赖倒置)
// ============================================================
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common"
import { Client } from "@elastic/elasticsearch"

@Injectable()
export class ElasticsearchService implements OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name)
  readonly client: Client

  constructor() {
    // 建立连接:node 指向 ES 的 REST API 地址
    // 注意 ES 8.x 关了 security(xpack.security.enabled=false),
    // 所以不需要 auth/apiKey,只填 node 就行
    //
    // ⚠️ 版本匹配:客户端和服务端主版本必须一致
    //   ES 服务端是 8.13.4,客户端用 @elastic/elasticsearch@8
    //   (9.x 客户端发 compatible-with=9 请求头,8.x 服务端只认 7/8 → 报错)
    this.client = new Client({
      node: process.env.ES_URL ?? "http://localhost:9200",
    })
    this.logger.log("Elasticsearch 客户端已初始化")
  }

  // 健康检查:ES 启动慢,消费者/索引初始化前最好确认 ES 活着
  async ping(): Promise<boolean> {
    try {
      await this.client.ping()
      return true
    } catch {
      return false
    }
  }

  // 模块销毁时关闭连接(跟 RedisService.onModuleDestroy 同理)
  async onModuleDestroy() {
    await this.client.close()
    this.logger.log("Elasticsearch 连接已关闭")
  }
}
