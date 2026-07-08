import "dotenv/config"
import { register, login, verifyToken } from "./auth.ts"
import { PrismaClient } from "../../src/generated/prisma/client.ts"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

let step = 0
const ok = (msg: string) => console.log(`✅ ${++step}. ${msg}`)
const fail = (msg: string) => { console.log(`❌ ${++step}. ${msg}`); process.exit(1) }

// 测试用唯一邮箱(用时间戳避免冲突)
const email = `test_${Date.now()}@example.com`
const password = "mySecret123"

// ① 注册
console.log("\n=== ① 注册 ===")
const user = await register("测试用户", email, password)
if (user.id && user.email === email && !("password" in user)) {
  console.log(`  注册成功:`, user)
  ok("注册 → 返回用户对象,不含 password 字段")
} else if ("password" in user) {
  fail("注册返回了 password 字段!select 没生效")
} else {
  fail(`注册结果不对: ${JSON.stringify(user)}`)
}

// ② 注册重复邮箱 → 抛错
console.log("\n=== ② 重复注册 ===")
try {
  await register("另一个", email, password)
  fail("重复邮箱没拦截")
} catch (e) {
  console.log(`  拦截了: ${(e as Error).message}`)
  ok("重复邮箱 → 抛错")
}

// ③ 数据库里存的是哈希,不是明文
console.log("\n=== ③ 密码加密验证 ===")
const dbUser = await prisma.user.findUnique({ where: { email } })
if (dbUser && dbUser.password !== password && dbUser.password.startsWith("$2")) {
  console.log(`  数据库存的: ${dbUser.password.slice(0, 25)}...`)
  ok("密码已加密(不是明文,是 $2b$ 哈希)")
} else {
  fail(`密码存储不对: ${dbUser?.password}`)
}

// ④ 登录成功 → 拿到 token
console.log("\n=== ④ 登录成功 ===")
const token = await login(email, password)
if (token && token.split(".").length === 3) {
  console.log(`  token: ${token.slice(0, 30)}...`)
  ok("登录 → 拿到 3 段 JWT")
} else {
  fail(`登录失败: ${token}`)
}

// ⑤ token 能解出用户信息
console.log("\n=== ⑤ token 验证 ===")
const payload = verifyToken(token)
if (payload && payload.userId === user.id && payload.email === email) {
  console.log(`  解出:`, payload)
  ok("verifyToken → 正确解出 userId 和 email")
} else {
  fail(`token 验证失败: ${JSON.stringify(payload)}`)
}

// ⑥ 错误密码登录 → null(不抛错)
console.log("\n=== ⑥ 密码错误 ===")
const wrongLogin = await login(email, "wrongPassword")
if (wrongLogin === null) {
  ok("密码错 → 返回 null(不抛错)")
} else {
  fail(`密码错应该返回 null,实际 ${wrongLogin}`)
}

// ⑦ 不存在的用户 → null(不抛错)
console.log("\n=== ⑦ 用户不存在 ===")
const ghostLogin = await login("nobody@nowhere.com", password)
if (ghostLogin === null) {
  ok("用户不存在 → 返回 null(防枚举攻击)")
} else {
  fail(`应该返回 null,实际 ${ghostLogin}`)
}

// ⑧ 无效 token → null
console.log("\n=== ⑧ token 无效 ===")
const invalidPayload = verifyToken("fake.token.here")
if (invalidPayload === null) {
  ok("无效 token → 返回 null(不抛错)")
} else {
  fail(`应该返回 null,实际 ${invalidPayload}`)
}

// 清理测试用户
await prisma.user.delete({ where: { id: user.id } })

console.log("\n🎉 鉴权全流程通过!")
await prisma.$disconnect()
setTimeout(() => process.exit(0), 1000)
