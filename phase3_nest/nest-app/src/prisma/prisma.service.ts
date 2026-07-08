// ============================================================
// PrismaService —— 全局数据库服务(NestJS + Prisma 标准模式)
// 继承 PrismaClient,白嫖所有查询方法;通过 IoC 全局共享单例
// ============================================================
import { Injectable, OnModuleDestroy } from "@nestjs/common"
import { PrismaClient } from "../generated/prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    // 用 URL 解析方式传参(关 10 技巧)
    // allowPublicKeyRetrieval: MySQL 8 认证需要,不然报 RSA key 错误
    const url = new URL(process.env.DATABASE_URL!)
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      allowPublicKeyRetrieval: true,        // ← MySQL 8 认证必需
      connectionLimit: 5,
    })
    super({ adapter })
  }

  // NestJS 生命周期钩子:模块销毁时断开数据库连接
  // 不写这个,服务关闭时连接池不会释放(你关 9 踩过的测试不退出坑)
  async onModuleDestroy() {
    await this.$disconnect()
  }
}
