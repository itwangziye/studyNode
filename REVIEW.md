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
🔥🔥🔥 **漏 await(第 11+ 次)**:`bcrypt.compare` / `service.findOne()` 未 await → Promise 被当 truthy → 鉴权形同虚设。异步方法**条件反射加 await**。
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
