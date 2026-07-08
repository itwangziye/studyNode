import "dotenv/config"
import express from "express"
import { register, login } from "./auth.ts"
import { authMiddleware } from "./middleware.ts"

// 用 Express 起个真实服务器测中间件(不真起端口,用 supertest 风格直接调)
const app = express()
app.use(express.json())

let step = 0
const ok = (msg: string) => console.log(`✅ ${++step}. ${msg}`)
const fail = (msg: string) => { console.log(`❌ ${++step}. ${msg}`); process.exit(1) }

// 测试用账号
const email = `test_${Date.now()}@example.com`
const password = "secret123"

// ① 先注册
await register("端到端测试", email, password)
console.log(`\n注册完成: ${email}`)

// ② 登录拿 token
const token = await login(email, password)!
if (token) ok(`登录 → 拿到 token`)
else fail("登录失败")

// 简单方案:直接调 authMiddleware,手动构造 req/res
function makeMockReq(authHeader?: string): any {
  return {
    headers: authHeader ? { authorization: authHeader } : {}
  }
}
function makeMockRes(): any {
  return {
    statusCode: 200,
    body: null,
    status(code: number) { this.statusCode = code; return this },
    json(data: any) { this.body = data; return this },
  }
}

// ④ 测试:带合法 token → 应该放行
console.log("\n=== ④ 合法 token → 放行 ===")
await new Promise<void>((resolve) => {
  const req = makeMockReq(`Bearer ${token}`)
  const res = makeMockRes()
  // @ts-ignore 手动调中间件
  authMiddleware(req, res, () => {
    // next() 被调用 = 放行
    if (req.user?.userId && req.user?.email === email) {
      ok(`放行 → req.user = ${JSON.stringify(req.user)}`)
    } else {
      fail(`中间件没正确设置 req.user: ${JSON.stringify(req.user)}`)
    }
    resolve()
  })
})

// ⑤ 测试:不带 Authorization 头 → 401
console.log("\n=== ⑤ 不带 token → 401 ===")
await new Promise<void>((resolve) => {
  const req = makeMockReq(undefined)
  const res = makeMockRes()
  // @ts-ignore
  authMiddleware(req, res, () => {
    fail("不该放行!")
    resolve()
  })
  if (res.statusCode === 401) ok("不带 token → 401 拦截")
  else fail(`状态码不对: ${res.statusCode}`)
  resolve()
})

// ⑥ 测试:伪造 token → 401
console.log("\n=== ⑥ 伪造 token → 401 ===")
await new Promise<void>((resolve) => {
  const req = makeMockReq("Bearer fake.token.here")
  const res = makeMockRes()
  // @ts-ignore
  authMiddleware(req, res, () => {
    fail("伪造 token 不该放行!")
    resolve()
  })
  // verifyToken 是同步的,next 不会被调,所以直接检查
  setTimeout(() => {
    if (res.statusCode === 401) ok("伪造 token → 401 拦截")
    else fail(`状态码不对: ${res.statusCode}`)
    resolve()
  }, 100)
})

// ⑦ 测试:格式错(只写 Bearer 没token)→ 401
console.log("\n=== ⑦ 格式错 → 401 ===")
await new Promise<void>((resolve) => {
  const req = makeMockReq("Bearer ")
  const res = makeMockRes()
  // @ts-ignore
  authMiddleware(req, res, () => {
    fail("格式错不该放行!")
    resolve()
  })
  setTimeout(() => {
    if (res.statusCode === 401) ok("格式错 → 401 拦截")
    else fail(`状态码不对: ${res.statusCode}`)
    resolve()
  }, 100)
})

console.log("\n🎉 端到端鉴权全流程通过!")
process.exit(0)
