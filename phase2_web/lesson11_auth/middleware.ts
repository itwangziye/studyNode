import { verifyToken } from "./auth.ts"
import type { Request, Response, NextFunction } from "express"

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // ① 拿请求头
  const authHeader = req.headers.authorization
  if (!authHeader) {                                    // ← 报错用 !
    return res.status(401).json({ error: "未提供 token" })
  }

  // ② 提取 token(去 Bearer 前缀)
  const token = authHeader.split(" ")[1]
  if (!token) {                                    // ← token 不存在
    return res.status(401).json({ error: "token 格式错" })
  }

  // ③ 验证
  const user = verifyToken(token)              // ← 别忘了这个返回 null 或 {userId, email}
  if (!user) {                                    // ← token 无效
    return res.status(401).json({ error: "token 无效或已过期" })
  }

  // ④ 放行
  ;(req as any).user = user                    // ← 挂到 req 上(as any 绕过类型)
  next()                                       // ← 放行!别 return
}