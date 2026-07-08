// ============================================================
// JwtStrategy —— token 验证策略(对应你关 11 的 verifyToken)
// Passport 自动从请求头 Authorization: Bearer xxx 取 token
// 验证成功后,把 payload return 出去 → 框架自动挂到 req.user
// ============================================================
import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

// payload 的形状 = 你签发 token 时放的数据
interface JwtPayload {
  userId: number
  email: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  //                              ↑ 用 passport-jwt 的 Strategy
  //                                          ↑ 名字 "jwt",跟 Guard 里对应
  constructor() {
    super({
      // 从请求头 Authorization: Bearer xxx 自动提取 token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // false = 不允许没 token 的请求通过(必须登录)
      ignoreExpiration: false,
      // 验证密钥(跟你签发时用的同一个 JWT_SECRET)
      secretOrKey: process.env.JWT_SECRET!,
    })
  }

  // Passport 验证 token 成功后,自动调这个方法
  // payload = jwt.verify 解出的内容({ userId, email })
  // return 的值会被框架挂到 req.user 上
  async validate(payload: JwtPayload) {
    return { userId: payload.userId, email: payload.email }
  }
}
