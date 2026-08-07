# Node.js 学习复习手册

> 每天开工时说"复习",我会带你过一遍这份手册,确认你记得多少。
> 标 ⭐ 的是高频考点/生产必踩坑,标 🔥 的是你实战踩过的真实坑。

---

## 阶段1:Node 内功(已完成 ✅)

### 关1 模块系统(ESM)

⭐ **铁律:Node 原生 ESM 路径必须带后缀**
```ts
import { x } from "./mod.ts"   // ✅ 必须带 .ts
import { x } from "./mod"      // ❌ ERR_MODULE_NOT_FOUND
```

⭐ **目录简写不支持**
```ts
import { x } from "./math"           // ❌ ERR_UNSUPPORTED_DIR_IMPORT
import { x } from "./math/index.ts"  // ✅ 必须写全
```
> 打包器(webpack/vite)能省,是因为它们帮你补全。Node 原生不做。

🔥 **re-export 不进作用域**
```ts
export { square } from "./advanced.ts"   // 过路传送带,square 不进当前作用域
console.log(square)                       // ❌ ReferenceError

// 想进作用域,必须显式 import:
import { square } from "./advanced.ts"    // 先接货
export { square }                          // 再发货
```

---

### 关2 异步与事件循环(灵魂)

⭐ **执行优先级(不可变)**
```
同步代码(一口气跑完)
    ↓
① nextTick 队列        ← 优先级最高,比 Promise 还急
    ↓
② 微任务队列           ← Promise.then
    ↓
③ 宏任务队列           ← setTimeout / I/O / setImmediate
```

⭐ **经典输出顺序**
```ts
console.log("1")              // 同步
setTimeout(()=>log("2"),0)    // 宏任务
Promise.resolve().then(()=>log("3"))  // 微任务
process.nextTick(()=>log("4"))        // nextTick
console.log("5")              // 同步
// 实际顺序:1 → 5 → 4 → 3 → 2
```

⭐ **setTimeout(0) vs setImmediate 顺序不固定**
- 都属于宏任务,但在事件循环的不同阶段(timers vs check)
- 在主模块里:顺序不确定(取决于 1ms 是否已过)
- **在 I/O 回调里:setImmediate 永远先于 setTimeout** ← 这才是 setImmediate 的设计用途

🔥🔥🔥 **await 是切割线(Day 2 补讲)**
```ts
async function f() {
  console.log("A")                        // 同步,立即执行
  await Promise.resolve()                 // ← 切割!函数暂停,让出控制权
  console.log("B")                        // 后半段 → 被扔进微任务队列
}
f().then(() => console.log("C"))
console.log("D")                          // 同步,立即执行
// 实际顺序:A → D → B → C
```
- **记忆法**:`await xxx` 后面的代码 = 被 `.then()` 包起来扔进微任务队列
- **影响**:所有 `await db.query()`、`await readFile()` 后的代码都比外面同步代码晚执行
- **在 I/O 回调里:setImmediate 永远先于 setTimeout** ← 这才是 setImmediate 的设计用途

---

### 关3 Buffer 与 Stream

⭐ **为什么用 Stream?省内存**
- `readFileSync` 一次性把整个文件塞内存 → 大文件爆内存
- Stream 把数据切成 chunk(如 64KB),流一点处理一点 → 内存恒定

⭐ **三种流**
- Readable(可读):`createReadStream`
- Writable(可写):`createWriteStream`
- Transform(转换):既读又写,夹在中间改数据

⭐ **pipeline 替代 pipe(工程标配)**
```ts
// ❌ 裸 pipe:不处理错误,error 没人监听会崩进程
readStream.pipe(writeStream)

// ✅ pipeline:自动处理错误 + 自动销毁流
import { pipeline } from "node:stream/promises"
await pipeline(readStream, transformStream, writeStream)  // 出错自动 reject
```

🔥 **Transform 在中间改数据**
```ts
const toUpper = new Transform({
  transform(chunk: Buffer, _encoding, callback) {
    callback(null, chunk.toString().toUpperCase())  // 改完吐出去
  }
})
readStream.pipe(toUpper).pipe(writeStream)
```

🔥 **正则 flag 位置**:`/\n/g`(flag 在斜杠后),不是 `/\ng/`

---

### 关4 文件系统(fs)

⭐ **stdout vs stderr(两个独立通道)**
```
console.log   → stdout(正常日志,归档查询)
console.error → stderr(错误日志,触发告警)
```
生产环境日志系统会分别收集,错误必须走 stderr 才能触发告警。

⭐ **异步循环:forEach 不能 await!**
```ts
// ❌ forEach 不等 async 回调
files.forEach(async f => await rename(f, dest))

// ✅ for...of 会按顺序 await
for (const f of files) { await rename(f, dest) }

// ✅✅ Promise.all 并行(独立任务,更快)
await Promise.all(files.map(f => rename(f, dest)))
```

⭐ **路径过滤用 endsWith,别用 indexOf**
```ts
files.filter(f => f.endsWith(".log"))   // ✅ 精确匹配后缀
files.filter(f => ~f.indexOf(".log"))   // ❌ 包含即匹配,误判 + 黑魔法不可读
```

⭐ **目录操作 API**
```ts
import { readdir, mkdir, rename, stat } from "node:fs/promises"
import { join } from "node:path"

await readdir(".")                       // 列文件名(不含路径)
await mkdir("./archive", {recursive:true})  // 递归建目录,已存在不报错
await rename(oldPath, newPath)           // 移动/重命名
const s = await stat(path); s.isFile()   // 判断是文件还是目录
join(dir, file)                          // 安全拼接路径,别手动塞 /
```

---

### 关5 EventEmitter

⭐ **本质:发布订阅模式**
```ts
bus.on("event", handler)    // 订阅
bus.emit("event", data)     // 发布
```

🔥 **Node 原生 TS 不支持"参数属性"**
```ts
// ❌ Node --experimental-strip-types 不支持(需要代码转换)
class X extends EventEmitter {
  constructor(private name: string) { super() }
}
// 报错:TypeScript parameter property is not supported in strip-only mode

// ✅ 拆成标准写法
class X extends EventEmitter {
  private name: string
  constructor(name: string) { super(); this.name = name }
}
```
> Node 原生只"擦除类型",不"转换代码"。enum/namespace/参数属性都不支持。

🔥 **默认导入 vs 命名导入**
```ts
import { EventEmitter } from "node:events"   // ✅ 命名导入(Node 内置模块用这个)
import EventEmitter from "node:events"       // ⚠️ 默认导入(靠 CJS 兼容层,定时炸弹)
```

⭐ **once = on + 自动注销**
```ts
bus.once("event", handler)   // 触发一次后自动 removeListener
// 适用:只需响应一次的事件(初始化完成、首次连接)
```

⭐⭐⭐ **error 事件是特殊的:不监听就崩进程!**
```ts
bus.emit("error", new Error("x"))   // 没人监听 → 进程崩溃退出
// 工程对策:每个 EventEmitter 都必须 on("error")
```

---

### 关6 HTTP 模块(徒手写服务器)

⭐ **核心结构**
```ts
import { createServer } from "node:http"
const server = createServer((req, res) => {
  const method = req.method ?? "GET"
  const url = req.url ?? "/"
  // 路由匹配...
})
server.listen(3000, () => console.log("running"))
```

⭐ **流式读 POST body(req 是个流!)**
```ts
let body = ""
req.on("data", (chunk: Buffer) => { body += chunk.toString() })
req.on("end", () => {
  // body 读完在这里处理
  // ⚠️ res.end() 必须在这调用,不能在外面!
})
return   // ⚠️ return 在外面!阻止走到 404
```

🔥 **异步 return 是命门**
- `req.on("end", ...)` 是异步触发,`return` 是同步立刻执行
- 没 `return` → 走到 404 → 响应已发出 → 回调里再 res.end() → 崩

⭐⭐⭐ **后端铁律:永远不信任客户端数据**
```ts
// ❌ 裸 parse,坏 JSON 直接崩进程
const data = JSON.parse(body)

// ✅ try-catch 兜底
try {
  const data = JSON.parse(body)
  // ...创建资源
  res.writeHead(201, {...}); res.end(JSON.stringify(newTask))
} catch {
  res.writeHead(400, {...}); res.end(JSON.stringify({ error: "JSON 格式错误" }))
}
```

⭐ **RESTful 规范**
- 创建资源:`201 Created`,返回服务端生成的完整对象(带 id)
- 不要把客户端发来的原样返回

⭐ **代码规范**
- `===` 不要 `==`(严格相等,避免类型转换坑)
- header 名驼峰 `Content-Type`
- `method`/`url` 用 `??` 兜底默认值

---

## 环境速查

```bash
# 跑某一课
cd ~/Desktop/lovenote/demo/studyNode
pnpm lesson 文件名.ts

# 测 server
bash test-server.sh

# Node 版本:v22.22.0(原生支持 TS,只擦除类型不转换)
# 包管理器:pnpm 11.3.0
```

---

## 阶段2 预告(待学)

- 关7 Express + 中间件(就是 server.ts 的升级版)
- 关8 路由组织
- 关9 MySQL + SQL
- 关10 Prisma ORM
- 关11 JWT 鉴权

## 阶段3 预告(待学)

- NestJS 全栈(对标简历)

---

## 阶段3:NestJS 全栈(进行中 ⏳)

### 关12 NestJS 三件套 + IoC
⭐ **IoC 核心:构造函数声明即注入,不 `new`**
```ts
@Injectable()                       // 贴标签:我可被 IoC 容器管理
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}  // 声明即注入
  // 对比:裸 Node 要 new PrismaClient() + 手动传
}
```
⭐ **三件套职责**:Module(装配)/ Controller(路由)/ Provider(逻辑),各司其职。

### 关12.5 CRUD 装饰器全套
⭐ **参数装饰器**:`@Body()` `@Param("id")` `@Query()` 取请求数据,替代 Express 的 `req.body/req.params`。
⭐ **异常类替代 res.status()**:throw `NotFoundException`(404)/`BadRequestException`(400)/`ConflictException`(409,资源重复)——不要 `res.status(404).json()`。

### 关13 PrismaService 集成
⭐ **全局单例**:`@Global()` + extends `PrismaClient`,所有模块共享一个连接池。
⭐ **driver adapter 模式**:Prisma 7 用 `@prisma/adapter-mariadb`,从 `DATABASE_URL` 解析 host/port/user/pass 传给 adapter。
🔥 **MySQL 8 认证**:`allowPublicKeyRetrieval: true` 不加会报 RSA key 错误。
🔥 **onModuleDestroy 必须写**:不写 `$disconnect()`,进程退出时连接池不释放。

### 关14 JWT 鉴权(Guard)
⭐ **Guard 替代中间件**:返回 boolean(true 放行 / false 自动 401),不用手写 `next()`。
⭐ **Passport 工作流**:`JwtAuthGuard("jwt")` → 调 `JwtStrategy.validate(payload)` → 验 token → 成功挂 `req.user`。
⭐ **import 不带 `.ts`**(与裸 Node 相反!):NestJS 用 tsc 编译,import 带 `.ts` 会报错。
🔥🔥🔥 **漏 await(第 12 次!关42 batchCreate)**:`bcrypt.compare` / `service.findOne()` / `tx.article.create()` 未 await → Promise 被当 truthy → 鉴权形同虚设 / 事务 COMMIT 时序不可控。异步方法**条件反射加 await**。
⭐ **`.env` 加载**:NestJS 入口只有 `main.ts`,必须 `import "dotenv/config"`。
⭐ **防枚举攻击**:login 统一返回"邮箱或密码错误",不区分"用户不存在"vs"密码错"。

### 关15 项目部署
⭐ **ValidationPipe 三连**:`whitelist`(剔除多余字段)+ `forbidNonWhitelisted`(多余即报错)+ `transform`(自动类型转换)。
⭐ **Dockerfile 多阶段**:builder 阶段编译 TS + `prisma generate`;prod 阶段只跑 JS,镜像更小。
🔥 **host 两套**:Docker 内 `host.docker.internal:3306`,宿主机直跑 `localhost:3306`。本地跑前先确认 `.env`!
🔥 **Mac Docker 不支持 `network_mode: host`** → 用端口映射 `3000:3000`。
🔥 **pnpm 11 审批拦截** → `pnpm-workspace.yaml` 的 `onlyBuiltDependencies` 声明 `bcrypt`/`prisma`/`@prisma/engines`。
🔥🔥🔥 **改 yaml 不够,必须跑 `pnpm approve-builds`**(Day 17 第 3 次踩)
- `pnpm-workspace.yaml` 改了 `onlyBuiltDependencies`,但 pnpm 把审批状态缓存在 store 里,改文件不生效
- `pnpm run start` / `nest start` 底层触发 `runDepsStatusCheck`,发现未审批直接退出 → `ERR_PNPM_IGNORED_BUILDS`
- **解法①(正式)**:`pnpm approve-builds` 交互式审批,一次性永久解决
- **解法②(绕过)**:跳过 `pnpm run`,直接 `npx tsc -p tsconfig.build.json && node dist/main.js`
- ⚠️ nest-app 的 `pnpm-workspace.yaml` 要和根目录保持一致,别漏 `prisma`(Day 17 漏过)

---

## 阶段4:NestJS 进阶 + Redis(进行中 ⏳)

### NestJS 组件执行顺序(必背)
```
Request → Middleware → Guard → Interceptor(前) → Pipe → Controller → Interceptor(后) → Response
                                          ↓ 异常冒泡 ↓
                                    ExceptionFilter 接住
```
记忆口诀:**M-G-I-P-C-I-F**(中间件-守卫-拦截器-管道-控制器-拦截器-过滤器)。

### 关16 全局异常过滤器
⭐⭐⭐ **`@Catch()` 空括号 vs `@Catch(HttpException)`**(连续 3 次盲区,Day 8 已补讲)
- `@Catch(类型)` 内部用 **`instanceof`** 判断:`exception instanceof HttpException` 为 true 才接
- `@Catch()` 空 = 不做类型判断,捕获**所有**异常(含 HttpException + 未知 Error)
- `@Catch(HttpException)` = 只接 HttpException 及其子类;普通 Error(`throw new Error('db挂了')`)**instanceof 为 false → 过滤器不接 → 漏给内置默认过滤器 → 堆栈直接泄露客户端**
- 生产用 `@Catch()` 空,确保所有异常都走脱敏逻辑。
- ⚠️ Day 9 复习必抽查:**要答出 `instanceof` 这个关键词**。

⭐ **getResponse() 两种形态**:
- `throw new HttpException('msg', 400)` → 返回字符串 `'msg'`
- 内置子类(NotFoundException 等) → 返回 `{ statusCode, message, error }`
- DTO 校验失败时 `message` 是**数组** `["title must be a string", ...]` → 需 `.join('; ')` 合并成一句,否则前端拿到数组不好展示。

🔥🔥 **安全红线:内部异常细节绝不泄露给客户端**
- `exception.stack`(堆栈)、数据库错误、SQL 语句都是攻击者情报
- 泄露堆栈 → 暴露代码文件路径/行号/依赖版本 → 攻击者据此找已知漏洞
- 正确做法:客户端只给脱敏文案("服务器内部错误"),详情写 `Logger.error()` 进服务端日志。

⭐ **ArgumentsHost 的作用**:执行上下文抽象,`host.switchToHttp()` 拿 req/res。因为 NestJS 不绑定协议(还能跑 WS/RPC),所以要显式切换。

### 关17 响应拦截器(Interceptor)
⭐⭐⭐ **拦截器是唯一"双向夹击"组件**:Controller 执行前后都运行
```
Request → Guard → ┌─ Interceptor(前) ─┐ → Pipe → Controller → ┌─ Interceptor(后) ─┐ → Response
                  │ 记开始时间         │                        │ tap打日志/map包壳  │
                  └───────────────────┘                        └───────────────────┘
```
⭐ **四个核心 API**:
- `next.handle()` → 返回 RxJS Observable,触发 Controller 执行(类似 Express next() 但不同)
- `.pipe()` → 给数据流加处理环节(类似 Node Stream 的 pipe)
- `tap(data => ...)` → 透明窥探,看数据但不改(打日志)
- `map(data => ...)` → 改造数据(把裸 data 包成 {code,message,data})

⭐ **过滤器管失败,拦截器管成功**——两者配对才有完整响应规范:
- 成功 → 拦截器的 map 包成 `{code:200, message:'success', data}`
- 失败 → 过滤器包成 `{code:<状态码>, message, data:null}`
- 异常会**跳过**拦截器的 map,直接被过滤器接住。

🔥 **改 main.ts 别漏注册**(Day 17 踩过):加拦截器时手滑删了 `app.useGlobalFilters(...)`,导致过滤器失效,异常回到 NestJS 默认格式 `{statusCode,message,error}`。改完全局组件要数一遍:Filters + Interceptors + Pipes 都在。

⭐ **全局组件注册才生效**:Filter/Interceptor/Pipe 写了文件但不 `app.useGlobalXxx()` 注册 = 死代码,不生效。

⭐⭐⭐ **异常让 Observable 断流,跳过 map**(Day 17 追问盲区)
- Controller 抛异常 → `next.handle()` 的 Observable 进入 **error 状态** → 数据流中断
- `map` 只在流正常吐数据时执行 → 流 error 了,map 收不到数据,不执行
- 异常直接冒泡被 `ExceptionFilter` 接住 → 这就是"过滤器管失败、拦截器管成功"的技术原理。

⭐⭐⭐ **pipe 顺序决定数据形态**(Day 17 追问盲区)
- RxJS `pipe` 从左到右串联,数据依次经过每个操作符(类比 Node Stream 的 .pipe())
- `pipe(tap, map)`:tap 先看原始 data → map 再包壳。tap 看到的是 Controller 原始返回值。
- `pipe(map, tap)`:map 先包壳 → tap 再看。tap 看到的是包壳后的 `{code,message,data}`,不是原始值!
- 想打原始数据日志必须 tap 在 map 前;想打最终响应日志则 tap 在 map 后。

### 关18 自定义管道(Pipe)
⭐ **Pipe 的位置和职责**
```
Interceptor(前) → ┌─ Pipe ─┐ → Controller → Interceptor(后)
                  │ 校验值  │
                  │ 改造值  │
                  │ 抛异常  │
                  └────────┘
```
- 做两件事:**校验**(不合法抛 BadRequestException)+ **改造**(string 转 number 等)

⭐⭐⭐ **Pipe 的三种用法分工**(Day 18 核心认知):
- `ValidationPipe` → 管 **DTO(@Body 对象)** 的校验和转换
- 内置 `ParseIntPipe`/`ParseBoolPipe` → 管 **@Param/@Query 单参数** 的转换
- 自定义 Pipe → 管 **业务规则** 校验(敏感词、权限、格式)

🔥🔥🔥 **ValidationPipe.transform:true 的副作用**(Day 18 踩的坑):
- `transform: true` 是总开关,同时转 DTO 和单参数
- 单参数场景:Controller 声明 `id: number`,框架提前把 `"abc"` → `NaN` 再传给自定义 Pipe → 自定义 Pipe 收到的是 NaN 不是 "abc" → 错误消息显示 "NaN 不是合法数字"
- **解法**:单参数转换用**内置 `ParseIntPipe`**(`import { ParseIntPipe } from "@nestjs/common"`),它和 ValidationPipe 时序由框架协调,不会丢原始值。

⭐ **PipeTransform 接口**:实现 `transform(value, metadata)` 方法,返回处理后的值或抛异常。自己写 Pipe 价值在**业务级校验**,别重造 ParseIntPipe。

### 关19 RBAC 角色权限(求职硬通货)
⭐ **RBAC 三要素**:用户→有角色(role)→角色对应权限→能否访问资源。比"登录/没登录"两层多一层"什么角色"。

⭐⭐⭐ **自定义装饰器 @Roles + Reflector 存取元数据**
```ts
// 装饰器:用 SetMetadata 把角色存到接口元数据
export const ROLES_KEY = 'roles'
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)

// Guard:用 Reflector 读出来
const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
  context.getHandler(),   // 先找方法级
  context.getClass(),     // 再找类级
])
```
- 装饰器和 Guard 必须用**同一个 ROLES_KEY** 才能对上(暗号)。

⭐ **RolesGuard 关键逻辑**(Day 19 踩过的逻辑 bug):
- `if (!requiredRoles) return true` —— **没贴 @Roles 的接口直接放行**(不是 false!false 会锁死整个项目)
- 贴了 @Roles 的才比对角色,不匹配抛 `ForbiddenException`(403)。

⭐ **401 vs 403 vs 404 的区别**(Day 19 追问盲区,答错过):
- 401 Unauthorized = **没登录**(token 缺失/失效/无效)→ JwtAuthGuard 管
- 403 Forbidden = **登录了但没权限**(角色不够)→ RolesGuard 管
- 404 Not Found = **资源不存在**(查不到数据)→ NotFoundException,和登录/权限无关!
- ⚠️ 别把 404(资源不存在)和 401(没登录)搞混!"查询不到数据"是 404 不是 401。
- 记忆口诀:**401 问"你是谁",403 说"你不能",404 说"没有这东西"**。

⭐ **role 从哪来**:token 不装 role(不安全),JwtStrategy.validate 查数据库拿 role,挂到 req.user。RolesGuard 从 req.user.role 读。
```ts
async validate(payload: JwtPayload) {
  const user = await this.prisma.user.findUnique({ where:{id:payload.userId}, select:{role:true} })
  return { userId: payload.userId, email: payload.email, role: user?.role }
}
```

⭐ **Guard 串联**:`@UseGuards(JwtAuthGuard, RolesGuard)` —— 先验登录,再验角色,顺序重要。

🔥 **prisma db execute 的表名转义坑**(Day 19):`\`User\`` 转义不对会导致 SQL 静默失败(exit 0 但没改数据)。改数据用 `prisma.user.update` 或 node 脚本,别用 db execute 改数据。

### 关20 Swagger 自动 API 文档
⭐ **Swagger 三步配置**:
```ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
// main.ts,app.listen 之前:
const config = new DocumentBuilder()
  .setTitle('Task API').setDescription('...').setVersion('1.0')
  .addBearerAuth()              // 启用 Bearer token(对应 JWT)
  .build()
const document = SwaggerModule.createDocument(app, config)
SwaggerModule.setup('api-doc', app, document)   // 访问路径 /api-doc
```

⭐ **文档装饰器**(贴在 Controller 上补充接口信息):
- `@ApiTags('任务')` —— 类级,接口分组
- `@ApiOperation({ summary: '创建任务' })` —— 方法级,接口描述
- `@ApiBearerAuth()` —— 标记接口需要 token

🔥 **改 main.ts 必须重启**(Day 20 踩坑):NestJS 启动时才把路由注册进 Express。改了 `SwaggerModule.setup()` 但没重启,路由表里没有 `/api-doc` → 404。watch 模式对配置类代码热更新有时不生效。
🔥 **端口占用排查**:`lsof -i:3000` 看谁占着,`start:debug` 报 `EADDRINUSE` 说明有旧进程,先 `lsof -ti:3000 | xargs kill -9`。

### 关21 自定义参数装饰器 @CurrentUser()
⭐ **参数装饰器原理**:NestJS 的 `@Body`/`@Param`/`@Query` 内部都调 `createParamDecorator()`。它接收一个函数,函数能拿 `ExecutionContext`,return 的值就是参数值。
```ts
// 内置 @Req() 简化原理:返回整个 request
export const Req = createParamDecorator((data, ctx) => ctx.switchToHttp().getRequest())

// 自定义 @CurrentUser():只返回 user,不返回整个 request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user
)
```

⭐ **@CurrentUser vs @Req 的区别**:
- `@Req()` 注入整个 request → Controller 和 Express 框架耦合(换框架全废)
- `@CurrentUser()` 只拿 user → 解耦 + 类型安全 + 可复用

⭐ **用法**:Guard 验证后把 user 挂到 req.user → Controller 用 `@CurrentUser() user` 直接拿。
```ts
@Post()
@UseGuards(JwtAuthGuard)
async create(@Body() body, @CurrentUser() user: { userId: number }) {
  return this.tasksService.create(body.title, user.userId)  // 干净,不碰 req
}
```

⭐ **自定义装饰器两类**(别混淆):
- **参数装饰器**(`createParamDecorator`):给方法注入参数值,如 `@CurrentUser()`
- **方法/类装饰器**(`SetMetadata`):给接口贴元数据标签,如关19的 `@Roles()`

---

## 阶段4 下半场:Redis 实战(关 22-25)

### 关22 Redis 集成 + Cache-Aside 缓存
⭐ **Cache-Aside(旁路缓存)模式 —— 缓存最经典模式**
```
请求 → 查 Redis 缓存 → 命中?返回(快)
                      未命中 → 查 MySQL → 写回 Redis(带TTL) → 返回
```

⭐ **RedisService 全局单例**(对标 PrismaService):
- `@Global() + @Module` + `@Injectable`,所有模块注入同一个实例
- 封装 `get/set/del`,带 `onModuleDestroy` 断开连接
- `set(key, value, ttl)` 用 `EX` 选项设过期秒数

⭐ **Redis 只存字符串**:存对象要 `JSON.stringify`,取出来要 `JSON.parse`。
⭐ **缓存 key 命名规范**:用冒号分隔层级 `task:all` / `task:1` / `task:lock:1`(不用下划线)。Redis 客户端工具按冒号折叠成树。

🔥 **cache vs cash 拼写**(Day 9 反复踩):`cache` = 缓存,`cash` = 现金。`CACHE_KEY` 别少 E。

⭐ **fire-and-forget**(可讨论):写缓存 `this.redis.set(...)` 不加 await,返回快但 Redis 挂了会报 unhandled rejection。生产用要配 try-catch。

### 关23 缓存三大问题防护(高并发面试必考)

⭐⭐⭐ **三大问题一句话区别**:
- **穿透**:查的数据**压根不存在** → 缓存永远写不进去 → 每次打 DB(黑客刷不存在的 id)
- **击穿**:**热 key** 过期瞬间 → 海量请求同时打 DB(TTL=0 那一刹那)
- **雪崩**:**大量 key 同时过期** → 多接口同时轰炸 DB(都设成 60s 同时到期)

⭐ **穿透防护:缓存空对象**
```ts
const data = await prisma.task.findUnique({where: {id}})
if (data) {
  redis.set(key, JSON.stringify(data), 60)   // 真实数据 60s
} else {
  redis.set(key, "null", 30)                  // 空值标记,短 TTL 30s
}
// 命中时判断:if (cached === "null") return null
```
- **为什么空值 TTL 要短?** 空数据后来可能被创建,短 TTL 保证过段时间能重查 DB。

⭐⭐⭐ **击穿防护:分布式锁单飞(Singleflight)**
```
缓存未命中
   ├── 抢到锁(SET NX) → 查 DB → 写缓存 → 释放锁(try/finally)
   └── 没抢到锁 → 轮询等缓存(50ms × 30次) → 超时抛 429
```
- 核心:**只有一个去查 DB,其他等缓存。**
- 锁实现:`SET lockKey "1" NX EX 3`(NX 只在 key 不存在时设置 = 抢锁核心;EX 3 防死锁)
- 释放锁:`DEL lockKey`,必须用 `try/finally` 保证报错也能释放

🔥🔥🔥 **击穿锁的 if/else 互斥结构**(Day 9 第一版写漏):
```ts
// ❌ 错误:不管抢没抢到锁都走到查 DB
const lock = await redis.setNx(...)
if (!lock) { 轮询等 }
const data = await prisma.findUnique(...)   // ← 没抢到锁的也走到这里!锁白加!

// ✅ 正确:if/else 互斥,两条路
if (lock) {
  try { 查DB + 写缓存 } finally { 释放锁 }
} else {
  轮询等缓存 → 超时抛 429
}
```

⭐ **雪崩防护:TTL 随机抖动**
```ts
private getRandomTtl(base: number, jitter: number): number {
  return base + Math.floor(Math.random() * jitter)
}
// 用法:getRandomTtl(60, 30) → 60~90 秒随机
```
- 每个缓存过期时间不同,避免同一时刻集体失效。

⭐ **穿透的进阶解法:布隆过滤器(Bloom Filter)**
```
请求 → 布隆过滤器(快速判断 id 可不可能存在)→ 可能存在才查缓存
                ↓ 一定不存在
              直接拒绝,Redis 和 DB 都不碰
```
- 终极防护 = **布隆过滤器 + 空值缓存 + 限流**。

⭐ **企业级 vs 你写的**:
| 问题 | 你写的(80分) | 企业级加强版 |
|------|--------------|------------|
| 穿透 | 缓存空对象 | + 布隆过滤器 |
| 击穿 | SET NX 锁 | + Redlock 多节点锁 / 逻辑过期(宁可给旧数据不让用户等) |
| 雪崩 | TTL 随机抖动 | + Redis 集群高可用 + 熔断降级 |

### 关24 限流拦截器(滑动窗口)

⭐⭐⭐ **固定窗口 vs 滑动窗口**:
- **固定窗口**:第 0-60s 允许 100 次,第 60-120s 允许 100 次。**边界翻倍**:59s 打 100 次 + 61s 打 100 次 = 2 秒内 200 次 💥
- **滑动窗口**:窗口 = [现在-60s, 现在],一直在动。精确剔除过期请求,**无边界翻倍风险**。

⭐⭐⭐ **滑动窗口右边界 = 现在**(Day 9 算错过,重点钉死):
```
窗口 = [现在 - WINDOW, 现在]
                ↑           ↑
            windowStart     now

例:现在=85秒, WINDOW=60秒
  windowStart = 85 - 60 = 25秒
  窗口 = [25秒, 85秒]   ← 不是 [0, 60]!
  数 25~85秒内的请求数
```

⭐ **用 Sorted Set 实现滑动窗口三步走**:
```
key: rate_limit:{ip}    member: 时间戳字符串    score: 时间戳(毫秒)

① 清旧:ZREMRANGEBYSCORE key 0 windowStart   ← 删窗口外的
② 计数:ZCARD key                            ← 数窗口内的
③ 判断:超限 → 429;没超 → ZADD 记录这次 + EXPIRE 设 key 过期
```

⭐ **为什么用 Sorted Set 不用计数器(INCR)?**
- 计数器只记总数,不知道每个请求什么时候来的 → 无法精确剔除过期的 → 固定窗口,边界翻倍
- Sorted Set 记住每个请求的时间戳 → 能删除窗口外的 → 真滑动

⭐ **Guard 执行顺序**:`@UseGuards(A, B)` 按数组顺序执行。
🔥 **限流必须前置**:挡在最外层,保护后面所有资源(验 token、Service、DB)。如果 JwtAuthGuard 在前,恶意请求每次都要走 token 解析 + 查 DB,限流就白挡了。

⭐ **限流维度**:
- 未登录 → 按 IP 限流(`rate_limit:{ip}`)
- 登录后 → 按 userId 限流(`rate_limit:{userId}`),每人独立配额
- ⚠️ 按 IP 限流的坑:**NAT 共享 IP**(公司 100 人共用一个公网 IP → 共享配额)

### 关25 Sorted Set 排行榜(进行中 ⏳)

⭐ **排行榜是 Sorted Set 的主场**:
- `ZINCRBY key increment member` —— 给 member 加分(完成任务 +1)
- `ZREVRANGE key 0 9 WITHSCORES` —— 按分数从高到低取 Top 10

🔥 **ioredis 返回类型都是 string**(Day 9 踩坑):
- `zincrby` 返回 `string`(`"50"` 不是 `50`),用时 `Number()` 转换
- `zrevrange WITHSCORES` 返回**扁平数组** `["1","50","2","30"]`,**不是** `[["1","50"],["2","30"]]`
- 遍历要两两配对:`for (let i = 0; i < arr.length; i += 2) { userId: arr[i], score: arr[i+1] }`

⭐ **路由顺序坑**:`@Get("ranking")` 必须写在 `@Get(":id")` **前面**,否则 `ranking` 被当 id 参数。

🔥🔥🔥 **Redis 字符串 + JS `+` 陷阱**(Day 10 追问踩的坑):
- Redis 返回值都是字符串,`score = "2"`
- `"2" + 1` → **`"21"`**(字符串拼接!不是加法!)
- `"2" - 1` → `1`(减法会转 number,但 `+` 不会)
- **JS `+` 规则:只要一边是字符串,就做拼接不做加法**
- 解法:后端 `Number(score)` 转换后再返回,或前端 `Number(score) + 1`
- 记死:**Redis 返回都是字符串,算术前必 `Number()` 转换**

---

## 阶段5:消息队列(关 26-28)

### NestJS 完整生命周期(关 26 踩坑后补讲)

⭐⭐⭐ **生命周期执行顺序**(关 26 踩坑核心):
```
启动:
  ① onModuleInit(子模块先,父模块后)
  ② onApplicationBootstrap(全局就绪)
  ③ app.listen(开始接收请求)
关闭:
  ④ onModuleDestroy(模块清理)
  ⑤ beforeApplicationShutdown(关闭前)
  ⑥ onApplicationShutdown(彻底关闭)
```

🔥🔥🔥 **消费者/连接依赖用哪个钩子?**(Day 11 踩坑):
```ts
// ❌ 错误:消费者用 onModuleInit
// 子模块的 onModuleInit 先于根模块执行
// → connect() 还没跑 → getChannel() 拿到 undefined 💥
export class TaskConsumer implements OnModuleInit {
    onModuleInit() { this.rabbit.getChannel() }  // 💥 channel 是 undefined
}

// ✅ 正确:用 onApplicationBootstrap
// 所有模块的 onModuleInit 都跑完(connect 已执行)→ 此时安全
export class TaskConsumer implements OnApplicationBootstrap {
    onApplicationBootstrap() { this.rabbit.getChannel() }  // ✅
}
```
- **铁律:依赖别人(连接/消费者)→ 用 `onApplicationBootstrap`;释放资源 → 用 `onModuleDestroy`**

⭐ **生命周期钩子用途速查**:
| 钩子 | 阶段 | 典型用途 |
|------|------|---------|
| `onModuleInit` | 启动 | 轻量初始化(不依赖其他模块),如 connect() |
| `onApplicationBootstrap` | 启动 | **依赖其他模块**(消费者/订阅/定时任务) |
| `onModuleDestroy` | 关闭 | **释放资源**(disconnect/close) |
| `beforeApplicationShutdown` | 关闭 | 记录关闭信号(SIGTERM/SIGINT) |
| `onApplicationShutdown` | 关闭 | 最终清理 |

### 关26 消息队列概念 + RabbitMQ 集成

⭐⭐⭐ **消息队列三大作用**(面试必问):
- **异步解耦**:耗时操作丢队列,立即响应用户(创建任务→立即返回,邮件后台发)
- **削峰填谷**:突发流量先进队列,消费者按自己节奏处理(秒杀场景)
- **服务解耦**:生产者不需要知道消费者是谁(任务服务不管邮件/短信/统计)

⭐⭐⭐ **RabbitMQ vs Kafka 选型**:
| 维度 | RabbitMQ | Kafka |
|------|----------|-------|
| 吞吐量 | 万级/秒 | **百万级/秒** |
| 消息留存 | **消费即删** | 可保留 N 天,**可回放** |
| 新消费者收历史? | ❌ 收不到 | ✅ `fromBeginning: true` |
| 路由能力 | ⭐强大(Exchange) | 简单(按 Topic 分区) |
| 适合场景 | 业务消息(订单/邮件) | 数据流(日志/行为追踪) |
- **一句话:业务消息选 RabbitMQ,数据流选 Kafka**

⭐ **RabbitMQ 消息模型**:
```
Producer → Exchange(交换机,做路由)→ Queue(队列)→ Consumer(消费者)
```
- 生产者**不直连队列**,丢给 Exchange,Exchange 根据规则路由到队列

⭐⭐⭐ **ack(消息确认)**(Day 11 追问盲区):
```ts
channel.consume("queue", (msg) => {
    // 处理消息...
    channel.ack(msg)   // ← 告诉 RabbitMQ「处理完了,可以删了」
})
```
- **不 ack 的后果**:消息变成 Unacked 状态,卡住不释放(不只是重启才重投)
- 只有消费者断开连接(重启/挂掉),Unacked 消息才重新变 Ready 投递
- **ack 本质:告诉 RabbitMQ 我处理完了,你可以删了**

🔥🔥 **消费异常必须 try-catch**(Day 11 追问):
```ts
// ❌ 危险:JSON.parse 抛异常 → ack 不执行 → 消息卡死
channel.consume("queue", (msg) => {
    const data = JSON.parse(msg.content.toString())  // 💥 坏消息抛异常
    channel.ack(msg)   // ← 根本执行不到!
})

// ✅ 正确:try-catch 包住,catch 里也 ack(丢弃坏消息)
channel.consume("queue", (msg) => {
    try {
        const data = JSON.parse(msg.content.toString())
    } catch (e) {
        logger.error("坏消息", e)
    }
    channel.ack(msg)   // 不管成功失败都确认
})
```
- 生产进阶:用**死信队列(DLX)**,失败的消息进死信队列人工处理

🔥 **RabbitMQ 命名用点号**(Day 11 踩坑):
- RabbitMQ key 用**点号**:`task.created`(不是 Redis 的冒号!)
- 队列名/Exchange 名两边必须**完全一致**,否则消息发出去没人收

🔥 **amqplib 2.x API 变更**:
- `connect()` 返回 `ChannelModel`(不是老版本 `Connection`)
- 查 `node_modules/amqplib/index.d.ts` 看真实类型

### 关27 RabbitMQ Exchange 四种类型

⭐⭐⭐ **Exchange 四种类型**(面试必背):
| 类型 | 路由规则 | 典型场景 |
|------|---------|---------|
| **Fanout** | 广播,所有绑定的队列都收 | 通知多个服务(创建任务→邮件+短信+统计) |
| **Direct** | 精确匹配 routing key | 不同消息进不同队列(key="email"→email队列) |
| **Topic** | 模式匹配(`*`一个词,`#`多个词) | 按业务类型分发(task.*) |
| **Headers** | 按消息头匹配 | 极少用 |

⭐ **Fanout Exchange 完整流程**:
```ts
// 生产者:声明 Exchange + publish
await channel.assertExchange("task.events", "fanout", {durable: true})
channel.publish("task.events", "", buffer)   // routing key 为空(Fanout 不看 key)

// 每个消费者:声明 Exchange + 声明 Queue + 绑定 + consume
await channel.assertExchange("task.events", "fanout", {durable: true})
const q = await channel.assertQueue("email_queue", {durable: true})
await channel.bindQueue(q.queue, "task.events", "")   // 绑定到 Exchange
await channel.consume(q.queue, (msg) => { ... ack ... })
```

🔥 **消费者必须注册到 Module**(Day 11 踩坑):
- `SmsConsumer`/`StatsConsumer` 写了但没加到 `providers` → NestJS 不实例化 → `onApplicationBootstrap` 不执行
- 排查依据:RabbitMQ 管理界面看队列消费者数 = 0

🔥 **改代码后可能要手动重启**(Day 11 踩坑):
- watch 模式对新增文件有时不自动刷新
- 新增 provider 后最保险:Ctrl+C 手动重启

### 关28 Kafka 集成实战(已完成 ✅)

⭐ **Kafka 核心概念**:
- **Topic**:主题(对标 RabbitMQ 队列,但消息不删,可留存)
- **Partition**:分区,并行处理(一个 Topic 分多个 Partition)
- **Consumer Group**:消费者组,同组内分摊消费,不同组各自独立消费
- **offset**:偏移量,消费者记住「读到哪了」,可重放

⭐⭐⭐ **Kafka vs RabbitMQ 本质区别**:
| | RabbitMQ | Kafka |
|---|---|---|
| 消息留存 | 消费即删 | 保留 N 天 |
| 新消费者收历史 | ❌ | ✅ `fromBeginning: true` |
| 消息确认 | 手动 `ack(msg)` | 自动提交 offset |
| 消费者标识 | 队列名 | `groupId`(消费者组) |

⭐ **kafkajs 核心 API**:
```ts
// 生产者
await producer.send({
    topic: "task-events",       // 短横线命名(Kafka 惯例)
    messages: [{ value: JSON.stringify(data) }]   // 字符串,不用 Buffer
})

// 消费者
const consumer = kafka.consumer({ groupId: "stats-group" })
await consumer.connect()
await consumer.subscribe({ topic: "task-events", fromBeginning: true })
await consumer.run({
    eachMessage: async ({ message }) => {
        const data = JSON.parse(message.value.toString())  // value 是 Buffer
        // Kafka 不用 ack!自动提交 offset
    }
})
```

⭐⭐⭐ **Consumer Group 同组 vs 不同组**:
- **同 groupId**:分摊消费(负载均衡),每条消息只被组内一个消费者收到
- **不同 groupId**:各自独立消费全部消息(类似 RabbitMQ Fanout)

⭐ **Kafka offset 回放**:消费者停掉后,消息仍在 topic 里。重启后从上次 offset 继续;`fromBeginning: true` 则从头读。RabbitMQ 做不到(消费即删)。

🔥🔥🔥 **单节点 Kafka 必须设 replication.factor=1**(Day 12 踩坑):
- 报错:`KafkaJSGroupCoordinatorNotFound: Failed to find group coordinator`
- 根因:单节点 Kafka 默认 `offsets.topic.replication.factor=3`,但只有 1 个 broker → 无法创建 `__consumer_offsets` topic → 消费者组协调器不可用
- 修复:docker-compose 加 `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1`
- ⚠️ `__consumer_offsets` 是 Kafka 存消费者 offset 的内部 topic,没它消费者组就无法工作

🔥 **kafkajs Logger 不能注入**(Day 12 踩坑):
```ts
// ❌ 错误:Logger 不是 @Injectable,不能构造函数注入
constructor(private readonly logger: Logger) {}

// ✅ 正确:自己 new
private readonly logger = new Logger(KafkaConsumer.name)
```

🔥 **拼写:kafaka → kafka**(Day 12 踩坑):
- `private readonly kafaka: KafkaService` ← 多了个 a
- 注入名和调用名必须一致,TS 自洽不报错但是规范问题

---

## 阶段7:工程化进阶 —— VSCode 断点调试(关 37-38)

### 关37 VSCode 断点调试 NestJS

⭐⭐⭐ **launch.json 必须写 nvm 全路径**(Day 14 踩坑):
```json
{
  "name": "Debug NestJS",
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "/Users/用户名/.nvm/versions/node/v22.22.0/bin/npx",
  "runtimeArgs": ["nest", "start", "--debug", "--watch"],
  "cwd": "${workspaceFolder}/phase3_nest/nest-app",
  "console": "integratedTerminal"
}
```
- **原因**:VSCode 启动 Node 子进程时**不加载 `.zshrc`/`.bashrc`**,nvm 的 node 不在子进程 PATH → 报"找不到 Node.js 二进制文件 npx"
- 解法:`which npx`(在终端里)拿到全路径,填进 `runtimeExecutable`

⭐ **调试核心面板**:
| 面板 | 看什么 | 类比前端 |
|------|--------|---------|
| **Variables** | 当前作用域所有变量值 | Chrome Sources 面板的 Scope |
| **Call Stack** | 函数调用栈,点哪层跳哪层 | Chrome Call Stack |
| **Debug Console** | 断点处执行表达式 | Chrome Console |

⭐ **快捷键**:
- `F5` 继续(到下个断点)
- `F10` 单步跳过(不进函数内部)
- `F11` 单步进入(进函数内部)
- `Shift+F11` 单步跳出

### 关38 断点调试实战(排查真实 Bug)

⭐ **断点类型**:
- **普通断点**:行号旁点一下
- **条件断点**:右键 → 满足条件才停(如 `id === 2`),海量请求里只抓特定那条
- **Logpoint**:不停顿,只打印日志(替代 console.log,不打断流程)

🔥🔥🔥 **Debug Console 执行异步要加 await**(Day 14 踩坑):
```js
// ❌ 返回 Promise { <pending> }
this.redis.get("article:1")

// ✅ 拿到真实值
await this.redis.get("article:1")
```
- Debug Console 的表达式是**立即求值**,async 不加 await 只返回 Promise 对象
- 想看 DB/Redis 数据,必须 `await this.xxxService.xxx()`

🔥 **Controller 里 `this.redis` 是 undefined**(Day 14 踩坑):
- RedisService 注入到 Service,没注入到 Controller
- 在 Controller 的断点处要查 Redis,走 `this.articleService.redis.get(...)`

⭐ **调试实战发现的 Bug**:update() 只删 `article:${id}` 详情缓存,**没删 `article:list:*` 列表缓存** → 改完文章列表还是旧数据。

---

## 阶段8:数据库进阶 —— 事务(关 41-42)

### 关41 Prisma 事务($transaction)

⭐ **ACID 四特性**:
| 字母 | 含义 | 通俗解释 |
|------|------|---------|
| **A** 原子性 | 全成功或全回滚 | "要么都做,要么都不做" |
| **C** 一致性 | 数据约束不被破坏 | 转账前后总额不变 |
| **I** 隔离性 | 并发事务互不干扰 | 你改数据时别人看到的是旧值 |
| **D** 持久性 | 提交后永久保存 | 断电也不丢 |

⭐⭐⭐ **Prisma $transaction 两种写法**:

**① 简单数组模式**(不能做逻辑判断,批量独立操作):
```ts
const [user, log] = await prisma.$transaction([
  prisma.user.create({ data: {...} }),
  prisma.log.create({ data: {...} }),
])
```

**② 交互式 async 模式**(能做 if/for 逻辑判断):
```ts
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: {...} })
  if (user.role === "admin") {
    await tx.log.create({ data: { userId: user.id } })
  }
  return user
})
```
- 区别:数组模式只能"都执行",async 模式能"根据条件决定执行什么"
- ⚠️ **事务回调里必须用 `tx`**,不能用 `this.prisma`(用了就脱离事务)

🔥🔥🔥 **事务边界:只放 DB 操作**(Day 14 核心理解):
```ts
// ✅ 正确:delByPattern 在事务外
const result = await this.prisma.$transaction(async (tx) => {
  // 只有 DB 操作
  for (const article of dto.articles) {
    await tx.article.create({ data: {...} })  // ← 必须 await!
  }
})
await this.redis.delByPattern("article:list:*")  // ← 事务外

// ❌ 错误:Redis 删缓存进事务
await this.prisma.$transaction(async (tx) => {
  await tx.article.create({...})
  await this.redis.del(...)  // ← Redis 不是 DB,不该进事务!
})
```
- **原因**:事务管的是数据库原子性,Redis 操作不在数据库事务里,放进去如果 DB 回滚了,缓存已经删了 → 数据不一致
- **正确顺序**:事务成功提交 → 再删缓存

🔥🔥🔥 **事务里 tx.* 也必须 await**(Day 14 关42 第12次踩坑):
```ts
// ❌ 错误:漏 await
for (const article of dto.articles) {
  const item = tx.article.create({ data: {...} })  // ← 返回 Promise,没 await
  createdArticle.push(item)  // push 的是 Promise,不是文章
}

// ✅ 正确:必须 await
for (const article of dto.articles) {
  const item = await tx.article.create({ data: {...} })
  createdArticle.push(item)
}
```
- **不加 await 的后果**:
  1. push 进数组的是 Promise,不是文章数据
  2. 事务回调 return 了数组(不是 Promise)→ Prisma `await` 一个非 Promise → 直接 resolve → **执行 COMMIT**
  3. 此时那些 `tx.article.create()` 的 Promise **可能还没执行完** → COMMIT 时序不可控 → 可能全进/进几个/一个没进
  4. 返回给前端的是 `[Promise, Promise, Promise]`,JSON 序列化成 `[{}, {}, {}]`
- **await 的真正作用:在 COMMIT 之前保证所有 DB 操作都执行完**

🔥🔥🔥 **`any` 是逃生舱,不是默认选项**(Day 15 关42):
```ts
// ❌ 危险:any 关闭类型保护,push Promise 也不报错
const createdArticle: any = []
createdArticle.push(tx.article.create({...}))  // ← tsc 不吭声,bug 漏到运行时

// ✅ 正确:标具体类型,push Promise 时 tsc 会报错拦下
const createdArticle: Article[] = []
createdArticle.push(tx.article.create({...}))  // ← tsc 报错!Promise<Article> 不能赋值给 Article
```
- **`any` 不只是"不检查",它是"主动关闭安全门"** → 标 `Article[]`,这个漏 await bug 在编译阶段就被 tsc 拦下,根本不用等运行时
- 铁律:业务代码里能用具体类型就用具体类型,`any` 是最后逃生舱

### 关43 N+1 查询问题 + 深分页优化

⭐⭐⭐ **N+1 问题**(面试高频):
```
查 10 篇文章 + 每篇作者名:
  ❌ N+1:  1 次查文章 + N 次循环查作者 = 11 次 SQL(1000 篇 = 1001 次 💥)
  ✅ JOIN: include 关联,1 次 SQL 搞定
```
- 解决:`include: { author: {...} }` 一次 JOIN 拿全
- 嵌套 include(多层关联):`include: { comments: { include: { user: {...} } } }` —— 文章带评论,评论再带评论人

⭐⭐⭐ **select vs include 的精确区别**(面试必问):
| | select | include |
|---|---|---|
| 作用 | 字段级白名单 | 关联加载 |
| 写了之后 | **只返回**标 true 的字段,其他全丢弃 | 返回所有标量字段 + **额外**带关联 |
| 用途 | 字段精简 + **敏感字段脱敏**(password) | 联表/JOIN |
| 类比 | "只要这几个,别的扔掉" | "全都要,顺便带关联" |

```ts
// select 脱敏 password(只取 id 和 name)
author: { select: { id: true, name: true } }

// include 会带出 User 所有字段,包括 password(危险!)
author: { include: true }  // ← 密码泄露!
```

⭐ **深分页(deep paging)问题**:
```
LIMIT 10 OFFSET 9990  ← MySQL 内部:扫描 10000 行,丢弃前 9990 行,返回 10 行
```
- 第 1000 页 → 扫描 + 丢弃 9990 行 → 极慢
- **缓存救不了**:深分页几乎没人查第二次,缓存命中率极低,第一次查询必然打 DB 且慢

⭐⭐⭐ **游标分页(cursor)解决深分页**:
```
skip+take:  LIMIT 10 OFFSET 9990     ← 数过去扔掉(OFFSET)
游标分页:   WHERE id > 9990 LIMIT 10 ← 直接定位,不扫描
```
| | skip+take | 游标分页 |
|---|---|---|
| 第 1000 页 | 扫描丢弃 9990 行 ❌ | WHERE 直接定位 ✅ |
| 能跳页 | ✅(传 page=1000) | ❌(只能下一页) |
| 适合 | 后台管理 | 信息流/无限滚动 |
- 核心:**OFFSET 是"数过去扔掉",游标是"WHERE 直接定位"**

---

## 阶段9:搜索引擎 —— Elasticsearch(关 44-45)

### 关44 ES 概念 + 为什么不用 LIKE

⭐⭐⭐ **LIKE 模糊查询的三大致命问题**(面试必问):
1. **慢,无法用索引**:`LIKE '%关键词%'` 开头是 `%` → B+ 树无法定位 → 全表扫描。(`LIKE '关键词%'` 前缀匹配能走索引)
2. **没有相关度排序**:LIKE 只能"匹配/不匹配",不能说"哪条更相关"。ES 用 BM25 算法给每条结果打分排序。
3. **中文分词差**:LIKE 把"全栈教程"当一个整体字符串,匹配不到"学习全栈,推荐这个教程"。

⭐⭐⭐ **ES vs MySQL 概念对照**(必背):
| MySQL | Elasticsearch | 说明 |
|-------|---------------|------|
| 表 table | **index** | 数据容器(注意:ES 的 index ≠ MySQL 的 index!) |
| 行 row | **document** | 一条数据,JSON 格式 |
| 列 column | **field** | document 里的 key |
| SQL | **DSL**(JSON) | ES 用 JSON 描述查询 |

⭐⭐⭐ **倒排索引(inverted index)** —— ES 快的根本原因:
- **正排索引(MySQL)**:文档 → 词(逐行扫描内容)
- **倒排索引(ES)**:**词 → 文档**(词作为入口,一查就到)
- 记忆:**倒排 = 词找文档,不是文档找词**(容易说反!)
- 类比书的目录:不是翻每页找关键词,而是查目录直接定位页码

⭐⭐⭐ **standard 分词器对 Node.js 的处理**(Day 16 实测):
- "Learn Node.js Express" → ["learn", "node.js", "express", "and", "nestjs"]
- **"Node.js" 点号没拆开!** standard 按 Unicode 文本分割规则,**字母间的点号不切**(认为是网址/版本号/专有名词)

⭐⭐⭐ **中文 standard 分词灾难**(Day 16 实测):
- "学习全栈开发教程" → ["学","习","全","栈","开","发","教","程"](单字!)
- 单字匹配 = 全是噪音(搜"全栈"命中"全部""栈桥")
- **必须用 ik 分词器**:按词切分 ["学习","全","栈","开发","教程"]

⭐ **ik 分词器两种模式**(Day 16 实测,方向容易答反):
| 模式 | 行为 | 用途 |
|------|------|------|
| `ik_max_word` | **最细粒度**,尽可能多切词 | **索引时用**(倒排索引多切,召回率高) |
| `ik_smart` | **智能切分**,尽可能少切 | **搜索时用**(少切,精确度高) |
- 记忆:**max = 最多词 = 最细**(不是最小!);smart = 智能 = 少切

### 关45 ES 集成 NestJS

⭐ **ES REST API 对照**(Day 16 实操):
| 操作 | HTTP | ES REST | 客户端 API | MySQL 类比 |
|------|------|---------|-----------|-----------|
| 建 index | PUT | `/articles` | `client.indices.create({index, mappings})` | CREATE TABLE |
| 检查在不在 | HEAD | `/articles` | `client.indices.exists({index})` | SHOW TABLES |
| 写文档 | POST | `/articles/_doc` | `client.index({index, id, document})` | INSERT |
| 搜索 | GET/POST | `/articles/_search` | `client.search({index, query})` | SELECT |

🔥🔥🔥 **重建 index 会清空数据**(Day 16 踩坑):
- `DELETE articles` + `PUT articles` = 删表建表,**数据全没**
- 必须重新 `POST` 写文档(就像 DROP TABLE + CREATE TABLE 后要重新 INSERT)

⭐ **ElasticsearchService 全局封装**(对标 RedisService/PrismaService):
- `@Global() + @Module` + `@Injectable`,单例共享
- 封装 `client: Client`(`@elastic/elasticsearch`)
- `onModuleDestroy` 关闭连接

⭐⭐⭐ **ArticleSearchService 三个方法**(自己写的):
```ts
// ① 建 index(启动时调一次)
async ensureIndex() {
  const exists = await this.es.client.indices.exists({ index: "articles" })
  if (exists) return
  await this.es.client.indices.create({
    index: "articles",
    mappings: {
      properties: {
        title: { type: "text", analyzer: "ik_max_word", search_analyzer: "ik_smart" },
        content: { type: "text", analyzer: "ik_max_word", search_analyzer: "ik_smart" },
        authorId: { type: "integer" }
      }
    }
  })
}

// ② 写文档到 ES(用 MySQL id 作 ES _id,方便同步)
async indexArticle(article: SearchableArticle) {
  await this.es.client.index({
    index: "articles",
    id: String(article.id),       // ← MySQL id 作 ES _id
    document: { title, content, authorId }
  })
}

// ③ 搜索(multi_match 同时搜多字段)
async search(keyword: string) {
  const result = await this.es.client.search({
    index: "articles",
    query: {
      multi_match: { query: keyword, fields: ["title", "content"] }
    }
  })
  return result.hits.hits.map(item => ({ ...item._source as any, score: item._score }))
}
```

⭐ **type 字段类型**:
| type | 含义 | 例子 |
|------|------|------|
| `text` | 可分词(过 analyzer) | title、content |
| `keyword` | 精确匹配(不分词) | 标签、状态码 |
| `integer` | 整数 | authorId |

🔥🔥🔥 **ES 客户端版本不匹配**(Day 17 踩坑):
- `@elastic/elasticsearch@9.x` 发 `compatible-with=9` 请求头
- ES 8.13.4 服务端只认 7/8 → 报 `media_type_header_exception`
- 9.x 客户端没有兼容配置项 → **降级到 `@elastic/elasticsearch@8` 匹配服务端**
- **铁律:客户端和服务端主版本必须一致**

⭐ **中文 URL 编码坑**(Day 16):
```bash
# ❌ curl "url?q=全栈" 中文没编码 → ES 收到乱码 → 0命中
# ✅ curl -G "url" --data-urlencode "q=全栈"
# ✅ 或用 DSL JSON 查询(NestJS 集成时用,库自动处理)
```

⭐⭐⭐ **MQ 异步同步 ES(RabbitMQ Fanout)**:
```
POST /articles → 写 MySQL → 发消息到 article.events exchange(只发一条!)
                                    ↓ Fanout 广播
                    ├── article.notify.queue → 通知消费者(发邮件/统计)
                    └── article.search.queue → 搜索消费者(写ES)
```
- **核心:一条消息,多个消费者各自消费**(Fanout 自动广播)
- 生产者不需要知道有几个消费者 → **服务解耦**(加新功能不改老代码)
- 选 RabbitMQ 不选 Kafka:**数据同步是一次性动作,不需要消息回放**,ack 保证可靠

⭐⭐⭐ **消费者职责单一**:
- `articles.consumer.ts` → 通知(各自内聚)
- `article-search-consumer.ts` → 搜索同步
- 不要混在一个文件:改一个会动到另一个,职责耦合

🔥🔥🔥 **消费者 indexArticle 必须 await**(Day 17 第13次踩):
```ts
// ❌ 漏 await → ack 早执行 → 消息丢失 → ES 没入库
this.articleSearchService.indexArticle({...})
channel.ack(message)

// ✅ await 保证写ES完成后再ack
await this.articleSearchService.indexArticle({...})
channel.ack(message)
```
- **ack 的本意是"我处理完了"**,没等 await 就 ack = 撒谎
- await 的作用:**保证处理完成后再ack,保证消息可靠性**

⭐⭐⭐ **OnApplicationBootstrap vs OnModuleInit**(连续2天答错):
- NestJS 生命周期:`onModuleInit`(子先父后) → `onApplicationBootstrap`(全部就绪)
- 消费者用 `onApplicationBootstrap`:因为 RabbitMQ 连接在 `AppModule.onModuleInit` 里执行
- 子模块的 `onModuleInit` 先跑 → 此时 `connect()` 还没执行 → `getChannel()` 拿到 undefined
- **铁律:依赖别人(连接/消费者)→ 用 `onApplicationBootstrap`**

### 关46 ES 进阶 —— highlight + bool 组合查询

⭐⭐ **highlight 高亮**(实测,演示层功能):
```json
GET /articles/_search
{
  "query": { "multi_match": { "query": "全栈", "fields": ["title", "content"] } },
  "highlight": {
    "fields": { "title": {}, "content": {} }   // ← 和 query 平级的顶层字段
  }
}
```
- 返回里**额外**多一个 `highlight` 字段,和 `_source` 并列,命中词被 `<em>` 包好
- `_source` 仍是干净原文,前端拿 `highlight` 渲染标红(`em{color:red}`)
- 🔥 **实测证据**:搜"全栈"返回 `<em>全</em><em>栈</em>` —— **两个 `<em>` = 两个 token**
  → 印证搜索侧 ik_smart 把"全栈"切成"全"+"栈"两个词(词典没收录"全栈")
- content 长字段默认只返回前几个命中片段(`number_of_fragments`),不是整篇

⭐⭐⭐⭐⭐ **bool 组合查询 —— 四子句**(ES 面试最高频考点!):
```json
"bool": {
  "must":     [{ "match": { "title": "Nest" } }],     // 必须 + 算分
  "should":   [{ "match": { "content": "Nest" } }],   // 有更好 + 加分(不强求)
  "filter":   [{ "term": { "authorId": 2 } }],        // 必须 + 不算分 + 缓存
  "must_not": [{ "term": { "status": "deleted" } }]   // 必须不 + 不算分
}
```

| 子句 | SQL 类比 | 语义 | 算分 | 缓存 |
|---|---|---|---|---|
| `must` | AND | **必须满足** | ✅ | ❌ |
| `should` | OR | **满足则加分,不满足不排除** | ✅(命中加分) | ❌ |
| `filter` | WHERE | **必须满足** | ❌ | ✅(位图 bitmap) |
| `must_not` | NOT | **必须不满足** | ❌ | ✅ |

🔥🔥🔥 **must vs filter 的灵魂区别**(面试必问):
- **筛选能力完全相同** —— 同样的条件,must 和 filter 筛出的文档**一模一样**
- **差别只有两点**:must 算分(参与相关度排序)、filter 不算分(对所有命中文档加 0 分)
- **性能优势两层**(都答全!):
  1. 跳过算分计算(BM25/TF-IDF 是 CPU 密集)
  2. 结果可缓存成位图(bitmap),下次直接命中
- **铁律:不需要比相关度的精确条件(范围/相等/枚举),必须用 filter 不用 must**

🔥 **should 的核心语义("有更好,不强求")**:
- should 命中给加分,不命中不排除 → 用于"**优先项**"
- ⚠️ **同一字段不能两头占**:title 已经在 must(必须命中),就不能再放 should(加分)
  → should 立刻失效(因为命中的本来就在 must 结果里,加分无意义)
- 正确用法:must 放硬条件(content 必须),should 放软优先(title 也有的加分)

⭐⭐⭐ **term vs match(易踩)**:
| 查询 | 是否分词 | 适用字段 | 例子 |
|---|---|---|---|
| `term` | ❌ 不分词,精确比对 | 数值/枚举/keyword | `{term: {authorId: 1}}`、`{term: {status: "published"}}` |
| `match` | ✅ 分词后匹配 | text 文本 | `{match: {title: "全栈"}}` |

🔥 **铁律**:文本字段用 match/multi_match,数值/枚举字段用 term。错配会搜不到或语义错。
- **反例**(面试常考):`{term: {title: "全栈开发"}}` → 0 命中
  - 原因:title 建索引时已被分词,存的是"全""栈""开发"… 根本没有"全栈开发"这个完整 token
  - term 不分词,拿"全栈开发"整体去比对 → 找不到

⭐ **multi_match vs match**:
- `match`:**单字段**分词匹配 —— `{match: {title: "keyword"}}`
- `multi_match`:**多字段**分词匹配 —— `{multi_match: {query, fields: ["title","content"]}}`
- 单字段别用 multi_match(浪费语义)

🔥 **JSON 格式高频错误**(已第 3 次踩,记为盲区):
1. **单引号不是合法 JSON**:`{status: 'draft'}` ❌ → `{"status": "draft"}` ✅
   - JS 对象用单引号/无引号,DSL 是 **JSON 只认双引号**
2. **数值字段不能带引号**:`{authorId: "3"}` ❌ → `{authorId: 3}` ✅
   - authorId 是 integer,字符串"3"语义错,term 比对可能失败
3. **字段名要对**:文章表作者字段是 `authorId`,不是 `id`/`_id`(_id 是 ES 文档主键)

⭐⭐ **实战 query 设计思路**(需求→子句映射):
| 需求关键词 | 选哪个子句 |
|---|---|
| "必须包含X" | `must`(算分) |
| "只保留X=某值" / "必须是某作者" | `filter`(精确硬条件,不算分) |
| "排除X" / "不能是Y" | `must_not` |
| "优先那些含X的" / "有X的排前面" | `should`(加分项) |

---

## 阶段A:并发与数据一致性(关 47-52)

### 关47 并发基础 —— 进程/线程/事件循环(🔥 漏 await 13 次的根因课)

⭐⭐⭐ **进程 vs 线程**:
| 概念 | 比喻 | 特点 |
|---|---|---|
| 进程(process) | 工厂车间 | 独立内存空间,开销大 |
| 线程(thread) | 车间里的工人 | 共享进程资源,开销小 |

- 传统后端(Java/PHP):**多线程**模型,一个请求派一个线程
- Node:**单线程**模型,整个进程只有 1 个主线程应付所有请求

⭐⭐⭐⭐⭐ **Node 单线程怎么并发?(核心)** —— 靠"异步 + 事件循环"两个机制:

**机制 A:遇到耗时操作,主线程不傻等,交出去**
```
主线程 → "libuv,帮我查 MySQL 用户数据"(派活,不亲自干)
       → 立刻解放,处理下一个请求
       → libuv 线程池(默认4线程)负责真正执行 I/O
```

**机制 B:事件循环负责"收尾"**
```
libuv/MySQL 查完 → 结果进事件循环的"待办队列"
事件循环不停转 → 主线程一有空 → 取出已完成的事件 → 执行对应回调(收尾)
```

🔥🔥🔥 **await 在时序链里的角色(根治盲区)**:
```
const user = await db.findUser(id)
                  ↑
1. db.findUser(id) 发起查询 → 返回 pending Promise(还没好)
2. await 挂起当前函数,把控制权还给事件循环(主线程去处理别的请求!)
3. MySQL 查完 → 结果进事件循环队列 → 唤醒 await → user 拿到真值
```
**await 做两件事:① 等结果(等事件循环收尾) ② 让出主线程(等待期间处理别的请求)**

🔥🔥🔥 **漏 await 破坏的就是"等收尾"这一步**:
```
const user = db.findUser(id)   // ← 没 await
// user = pending Promise 对象(查询刚发起,还没完成)
if (!user) throw Unauthorized  // Promise 是对象 → 永远 truthy → 永远不进 if
```
- **根因:发起查询后跳过了"等事件循环收尾",拿了个没完成的 Promise 空壳当结果用**
- Promise 不管 pending/fulfilled/rejected,本身永远是对象 → truthy → 鉴权形同虚设

⭐⭐ **串行 vs 并发(实测对比)**:
```ts
// 串行:总耗时 = 各任务之和(1+1+1=3秒)
const a = await query()  // 等1秒
const b = await query()  // 等1秒
const c = await query()  // 等1秒

// 并发:总耗时 = 最慢那个(三个同时发起,只等1秒)
const [a, b, c] = await Promise.all([query(), query(), query()])
```
- 关键:Promise.all 让多个任务**同时发起**,主线程不等单个完成,只等最慢那个收尾

⭐⭐⭐ **"并发但不并行"的精确含义**:
- **并发(concurrent)**:主线程不停切换任务,看起来同时(靠事件循环)
- **并行(parallel)**:多个任务在同一时刻真正同时执行(靠多核多线程)
- Node 单线程只能"并发",I/O 靠 libuv 线程池才能"并行"

### 关48 事务隔离级别 + 锁

⭐⭐⭐⭐⭐ **三个并发问题**(面试必背):
| 问题 | 现象 | 一句话 |
|---|---|---|
| 脏读 | 读到**未提交**的数据(对方没 commit,先读了;对方若 rollback,数据就是假的) | 读"假"的(未提交) |
| 不可重复读 | 同一**行**读两次,值变了(对方 commit 了 UPDATE) | 读"变"的(同一行被改) |
| 幻读 | 同一**查询**执行两次,行**数量**变了(对方 commit 了 INSERT/DELETE) | 读"多/少"的(行数变) |

🔥 **脏读关键词是「未提交」,不是「废弃」**(08-07 答错:废弃=已扔掉;脏读=还没确认,可能 commit 也可能 rollback)。
严重程度:脏读 > 不可重复读 > 幻读。

⭐⭐⭐⭐⭐ **四个隔离级别**(从宽松→严格,每升一级多防一个问题):
| 隔离级别 | 防脏读 | 防不可重复读 | 防幻读 | 备注 |
|---|---|---|---|---|
| 读未提交 ReadUncommitted | ❌ | ❌ | ❌ | **导致脏读**(允许读未提交) |
| 读已提交 ReadCommitted | ✅ | ❌ | ❌ | Oracle/PG 默认 |
| 可重复读 RepeatableRead | ✅ | ✅ | ❌(MySQL 靠 Next-Key Lock 防住了!) | **MySQL 默认** |
| 串行化 Serializable | ✅ | ✅ | ✅ | 最慢,事务排队(等同单线程) |

🔥🔥🔥 **因果方向(08-07 答反过)**:**级别越高 → 防得越多,不是导致越多!**
- ❌ "可重复读会导致脏读"(说反了)
- ✅ "读未提交会导致脏读,可重复读防住脏读"
- 级别每升一级,在低级别基础上**多防**一个问题

⭐⭐ **为什么不全用最高级(串行化)?** 事务排队执行=丧失并发,1000 请求变 1 个 1 个处理。工程要权衡"够安全+性能可接受"。MySQL 选可重复读是折中。

⭐⭐⭐ **锁的分类**:
| 锁 | 思想 | 适合场景 | SQL/实现 |
|---|---|---|---|
| 悲观锁 | "肯定有人抢,先锁死" | 冲突频繁 | `SELECT ... FOR UPDATE`(排他锁) |
| 乐观锁 | "大概率没人抢,失败再说" | 读多写少/冲突少 | version 字段 + WHERE version=x(关49实战) |
| 共享锁(S锁/读锁) | 多人能读,不能改 | | `SELECT ... LOCK IN SHARE MODE` |
| 排他锁(X锁/写锁) | 只有我能改 | | `FOR UPDATE`、UPDATE/DELETE 自带 |

⭐ **Prisma 设置隔离级别**:
```ts
await this.prisma.$transaction(async (tx) => {
  // DB 操作
}, {
  isolationLevel: 'ReadCommitted',   // 显式指定:ReadUncommitted/ReadCommitted/RepeatableRead/Serializable
  timeout: 5000
})
```
默认就是 MySQL 的 RepeatableRead。

⭐⭐ **转账场景面试题**(三个要点):
1. 必须用事务(A 扣钱 + B 加钱原子性)
2. 选可重复读(不选读未提交,因为读未提交导致脏读,可能读到回滚中的假余额)
3. 扣减时用 `SELECT ... FOR UPDATE` 锁住 A 那行,别的事务想改只能等 → 保证余额不变成负数
