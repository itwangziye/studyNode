// ============================================================
// prisma.config.ts —— Prisma 7 的新配置文件(CLI 用)
// url 从 schema.prisma 搬到这里了。schema 只管"结构",config 管"连接"
// ============================================================
import "dotenv/config"                              // 加载 .env 到 process.env
import path from "node:path"
import { defineConfig } from "prisma/config"

export default defineConfig({
  // schema 文件位置
  schema: path.join("prisma", "schema.prisma"),

  // 早期迁移用的影子数据库连接(直接复用开发库)
  migrations: {
    path: path.join("prisma", "migrations"),
  },

  // 数据库连接 url(从这里读,不再写在 schema 里)
  // prisma migrate / db pull 用这个 url 连数据库
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
