// ============================================================
// JwtAuthGuard —— 鉴权守卫(对应你关 11 的 authMiddleware)
// 用法:贴 @UseGuards(JwtAuthGuard) 就能保护路由
// 工作流程:JwtAuthGuard → 调 JwtStrategy → 验 token → 成功挂 req.user
// ============================================================
import { Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
//                       ↑ 继承 Passport 的 AuthGuard,传 "jwt" 对应 JwtStrategy
//                       不用自己写 canActivate,Passport 帮你封装好了
