import "dotenv/config"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaClient } from "../../src/generated/prisma/client.ts"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

export interface AuthUser {
  id: number
  name: string
  email: string
}

// ① 注册:密码加密后存库
export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  // 步骤 1:查 email 是否已存在
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {                          // ← "已存在"怎么判断?
    throw new Error("邮箱已被注册")    // 抛错(或 return null,你选)
  }

  // 步骤 2:加密密码(bcrypt.hash)
  const passwordHash = await bcrypt.hash(password, 10)

  // 步骤 3:创建用户,存的是哈希不是明文!
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash                  // ← 存哪个变量?password 还是 passwordHash?
    },
    select: { id: true, name: true, email: true }   // ← 关键:select 排除 password!
  })
  return user
}

// ② 登录:验证密码,签发 token
export async function login(
  email: string,
  password: string
): Promise<string | null> {
  // 步骤 1:查出用户(含 password,因为要 compare)
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null               // ← 用户不存在?返回什么?

  // 步骤 2:比对密码
  const match = await bcrypt.compare(password, user.password)   // ← 哪个方法?比对什么?
  if (!match) return null              // ← 密码错?返回什么?

  // 步骤 3:签发 token
  const token = jwt.sign(
    { userId: user.id, email: user.email },    // ← 载荷:放什么
    process.env.JWT_SECRET!,                            // ← 密钥从哪读?
    { expiresIn: "7d" }                         // ← 过期时间,比如 "7d"
  )
  return token
}

// ③ 验证 token(中间件用)
export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
    return { userId: payload.userId, email: payload.email }
  } catch {
    return null                        // ← 出错返回什么?
  }
}