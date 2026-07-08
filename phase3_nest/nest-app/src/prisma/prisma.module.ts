// ============================================================
// PrismaModule —— 全局共享 PrismaService
// @Global() 让所有模块都能注入 PrismaService,不用每个模块都 import
// ============================================================
import { Global, Module } from "@nestjs/common"
import { PrismaService } from "./prisma.service"

@Global()                                    // ← 关键!全局可见
@Module({
  providers: [PrismaService],
  exports: [PrismaService],                  // ← 导出,别的模块才能注入
})
export class PrismaModule {}
