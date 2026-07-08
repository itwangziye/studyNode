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
