// ============================================================
// AuthModule —— 鉴权模块装配
// 注册 JwtModule(签发/验证 token)、PassportModule(Guard 机制)
// 提供 AuthService + JwtStrategy,导出给其他模块用
// ============================================================
import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule } from "@nestjs/passport"
import { PrismaModule } from "../prisma/prisma.module"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { JwtStrategy } from "./jwt.strategy"

@Module({
  imports: [
    // JwtModule.register 配置 jwt 签名参数
    // secret: 跟你关 11 用的同一个 process.env.JWT_SECRET
    // signOptions: 过期时间 7 天(跟你关 11 一致)
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: "7d" },
    }),
    // PassportModule 提供 Guard 机制(G 大写,不是 passport)
    PassportModule,
    // PrismaModule 全局可见,但显式 imports 更规范
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],   // ← 导出,让 TasksModule 能用 Guard
})
export class AuthModule {}
