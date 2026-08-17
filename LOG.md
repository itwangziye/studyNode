# 每日学习记录

> 每天学完追加一节。格式:日期 + 当天过关 + 踩过的坑 + 状态。

---

## 2026-07-03 (Day 1) — 阶段1 全部完成 🎉

### 今日过关:6 关

| 关 | 主题 | 用时感 | 掌握度 |
|---|---|---|---|
| 1 | 模块系统 | 快 | 扎实 |
| 2 | 事件循环 | 中 | 核心理解,nextTick 优先级一开始记反 |
| 3 | Stream | 中 | pipeline/Transform 会用了 |
| 4 | 文件系统 | 快 | 会用 API,工程规范补上了 |
| 5 | EventEmitter | 中 | 参数属性那个坑印象深 |
| 6 | HTTP 服务器 | 慢 | 改了两轮,最深的一关 |

### 🔥 今天踩过并记住的坑

1. **ESM 路径不带后缀** → `ERR_MODULE_NOT_FOUND`(关1)
2. **re-export 不进作用域** → `console.log` 报 ReferenceError(关1)
3. **nextTick 比 Promise 优先级高** → 预测 D/C 顺序反了(关2)
4. **正则 flag 位置** → `/\ng/` 写成 `/\n/g` 导致行数统计为 0(关3)
5. **forEach 不等 async** → 异步循环必须 for...of(关4)
6. **参数属性不被 Node 原生 TS 支持** → `constructor(private x)` 报错(关5)
7. **error 事件不监听就崩进程** → EventEmitter 铁律(关5)
8. **JSON.parse 不 try-catch** → 坏 JSON 直接搞崩服务器(关6)
9. **POST 返回 data 而非 newTask** → 存对了返回错了(关6)
10. **异步分支里的 return** → 不 return 会走到 404(关6)

### 📈 能力变化

- **之前**:只会前端 `async/await`,不懂底层调度
- **现在**:能不用框架徒手写 HTTP API 服务器,懂得防客户端恶意输入

### 🎯 明天计划

- 开工先复习(我会抽查今天 10 个坑里的 3-5 个)
- 进入阶段2 关7:Express + 中间件

### 💬 一句话总结

> 后端和前端最大的区别:前端是"让用户用得爽",后端是"防着用户搞破坏"。今天学会了不信任任何客户端数据。

---

## 2026-07-04 (Day 2) — 复习巩固日 📖

### 今日任务:Active Recall 复习 Day 1

没有学新课,专门用来**科学复习**昨天(Day 1)的 6 关内容。
方法:主动回忆(Active Recall)——我抛问题,凭记忆答,不准翻 REVIEW.md。

### 第一轮:快速回忆(5 题)— ✅ 全对

| 题 | 考点 | 回答 | 判定 |
|---|---|---|---|
| Q1 | ESM 路径后缀 | 没加 .ts | ✅ |
| Q2 | 事件循环顺序 | 1>5>4>3>2 | ✅ |
| Q3 | pipe vs Transform | pipe 不改数据,transform 能操作 | ✅ |
| Q4 | JSON 崩溃根因 | 没 try-catch | ✅ |
| Q5 | 异步 return | 走到 404 | ✅ |

**结论**:昨天的核心点都留住了,记忆层过关。

### 第二轮:应用迁移(3 题)— 🟡 暴露 3 个盲区

| 题 | 考点 | 回答 | 正确 | 判定 |
|---|---|---|---|---|
| Q1 | await 的切割机制 | D>A>B>C | A>D>B>C | ❌ |
| Q2 | 输入校验多层 | 非空判断 | 语法+语义多层 | 🟡 只说一半 |
| Q3 | 大文件选型 API | readStream/writeStream | createReadStream + pipeline | 🟡 API 名错 |

### 🔥 今天补的 3 个盲区(已重讲)

#### 盲区1 ⭐⭐⭐:`await` 是切割线,把后半段扔进微任务队列
```ts
async function f() {
  console.log("A")                        // 同步
  await Promise.resolve()                 // ← 切割!暂停,让出控制权
  console.log("B")                        // 后半段 → 微任务队列
}
f().then(() => console.log("C"))
console.log("D")
// 实际顺序:A → D → B → C(不是 A>B>C>D)
```
- **记忆法**:`await xxx` 后面的代码 = 被 `.then()` 包起来扔进微任务队列
- **影响**:所有 `await db.query()`、`await readFile()` 后的代码都比外面同步代码晚执行

#### 盲区2 ⭐:输入校验是立体的,不止一层
```
第①层 JSON 语法对不对   → try-catch(昨天做了)
第②层 必填字段在不在     → if (!data.title)  ← 你只说了这层
第③层 字段值合不合法     → typeof / 长度 / 范围
```
- **大师认知**:昨天校验"语法",今天校验"业务语义"
- 预告:阶段3 NestJS 会用 **Zod** 库自动做这些

#### 盲区3 ⭐:API 名记准(create + pipeline)
| 错误记忆 | 正确 |
|---|---|
| ~~readStream~~ | `createReadStream` |
| ~~writeStream~~ | `createWriteStream` |
| 漏掉的关键 | `pipeline`(from `node:stream/promises`)—— 工程标配 |

### 📈 复习效果评估

| 维度 | Day 1 结束 | Day 2 复习后 |
|---|---|---|
| 记忆保持 | 短期 | ✅ 转为长期(核心点全记住) |
| 理解深度 | 会用 | ✅ 能迁移(但 await/校验需巩固) |
| 薄弱点 | 10 个坑 | 收窄到 3 个(await 切割、多层校验、API 名) |

### 🎯 明天计划

- 开工先**针对 3 个盲区做定向复习**(await 顺序、校验层次、API 名)
- 然后进 **阶段2 关7:Express + 中间件思维**
  - 预告:Express 底层就是你昨天徒手写的 `node:http`,框架只是帮你少写 if-else
  - 中间件本质 = 你写的那个 `(req, res) => {}` 回调,串成链条

### 💬 一句话总结

> "记住"不等于"会用"。今天用应用题测出 3 个"以为懂了其实没透"的点,这才是真复习——查漏补缺比刷新课更重要。明天先打这 3 个补丁,再往前学。

---

## 2026-07-06 (Day 3) — await 专项攻坚 + Express 开局

### 今日任务:打 3 个补丁 → 进阶段2

#### 补丁复习结果

| 补丁 | 第一轮 | 第二轮 | 第三轮 | 最终 |
|---|---|---|---|---|
| 1 await 顺序 | ❌ B 放最后 | ❌ 切菜放关门后 | — | ✅ 通了 |
| 2 校验三层 | 🟡 只一层 | — | — | ✅ 补全 |
| 3 API 名 | ❌ reaStream | — | — | ✅ 记准 |

**补丁1 是今天的重点**:连续三轮才打通 await,因为有两个深层误解。

### 🔥 今天打透的两个认知(最值钱)

#### 1. await 之前的代码是同步的(连错两次的根因)
```
async function cook() {
  console.log("切菜")     ← await 之前,同步,立刻执行!
  await xxx               ← 这才挂起
  console.log("盛饭")     ← await 之后,异步,扔进队列
}
```
- 我一直以为"调用 async 函数 = 整个延后"。错。
- **async 函数调用时,同步部分立刻跑,直到撞上 await 才停。**

#### 2. cook() vs await cook() 的真正区别(纠正"阻塞"误概念)
| | cook()(不 await) | await cook() |
|---|---|---|
| 线程阻塞? | 不阻塞 | 不阻塞(Node 永远不阻塞,除同步IO) |
| 下一行 | **不等,立刻执行** | **等 cook 完成** |
| 拿得到结果? | ❌ Promise 还 pending | ✅ 已 resolve |
| 危险 | 🔴 后台"失联",数据可能没存完就说成功 | ✅ 安全 |

- **不能用"阻塞"想 Node 异步**,要用"等不等"
- 危险场景:`saveUser()` 不 await → `res.end("成功")` → 谎报!数据没存完

### await 三句话总结(钉死)
```
1. async 函数调用:同步部分立刻执行,直到遇到 await
2. 遇到 await:挂起(夹书签),交还控制权,外面代码立刻继续
3. await 区别:下一行"等不等它干完"
```

### 🎯 明天计划

- await 已通,直接进阶段2 关7 Express
- 预告:Express 底层 = node:http + 中间件链

---

## 2026-07-06 (Day 4) — Express + 分层 + MySQL 三连冠 🎉

### 今日过关:3 关(阶段2 主力推进)

| 关 | 主题 | 掌握度 | 关键收获 |
|---|---|---|---|
| 7 | Express + 中间件 | ✅ 扎实 | app.use/app.get/post、中间件链、next() |
| 8 | 路由组织 + 分层架构 | ✅ 扎实 | routes→controller→data 三层、Router、req.params |
| 9 | MySQL + SQL 基础 | ✅ 扎实 | CRUD SQL、? 占位符防注入、createPool、DATABASE_URL |

### 🔥 今天踩过并记住的坑

#### 关7 Express
1. **`if (!title)` 又写反**(第4次!)→ `if (title)` 变成"有 title 就报错"。改为 `if (!title)` 后修好
2. **`return` 忘加**(第3次)→ 不 return 会响应两次,Express 报 "Cannot set headers after sent"
3. **中间件 `next()`** → 不调 next,请求卡死,客户端超时

#### 关8 分层架构
4. **`delete tasks[i]` 不是真删除** → 只置空,长度不变。要用 `tasks.splice(i, 1)` 真删
5. **`~indexOf` 黑魔法**(第2次用)→ 这次逻辑碰巧对,但可读性差。改用 `!== -1`
6. **`Number.isNaN("1")` 永远 false** → 字符串不是 NaN 值。要先 `Number(id)` 转换再判
7. **状态码 201 vs 200 vs 204** → POST 创建用 201,查询用 200,删除用 204(无 body)

#### 关9 MySQL
8. **`process.env.DB_PASSWORD` 读不到** → Node 原生不读 .env 文件,要 `import "dotenv/config"`
9. **连接池不释放导致超时 5 分钟** → 测试脚本要 `process.exit(0)`,服务器场景池子常驻
10. **`done: 0` 不是 `false`** → MySQL TINYINT 返回 0/1,mysql2 不自动转 boolean(这就是为什么要用 Prisma)

### ⭐ 今天最重要的两个认知

#### 1. 中间件链 = 收费站(关7 核心)
```
请求 → [express.json] → [logger] → [路由处理函数] → 响应
        next()          next()      res.json()=终点
```
- 中间件处理完必须 `next()` 接力,否则请求卡死
- 路由处理函数是终点,直接 `res.json()` 响应,不 next
- 拦截型(如鉴权)不 next,直接 `res.status(401)` 挡住

#### 2. SQL 注入不是报错,是"成功执行攻击者 SQL"(关9 核心)
```ts
// ❌ 拼字符串:id = "1 OR 1=1" → WHERE id = 1 OR 1=1 → 返回所有数据!
pool.query(`SELECT * FROM tasks WHERE id = ${id}`)

// ✅ 占位符:"1 OR 1=1" 被当字符串值整体匹配 → 安全
pool.query("SELECT * FROM tasks WHERE id = ?", [id])
```
- SQL 注入最可怕之处:**不报错,静默泄露/破坏数据**
- `?` 占位符做参数化查询,值永远是"数据"不是"指令"

### 📈 能力跃迁

| 维度 | Day 1(起步) | Day 4(今天) |
|---|---|---|
| 代码组织 | 一坨 if-else | routes/controller/data 三层分离 |
| 数据存储 | 内存数组(重启丢) | MySQL 真持久化 |
| 框架 | 不用 | Express + 中间件 + Router |
| 安全意识 | 无 | SQL 注入、输入校验、不信任客户端 |
| 项目配置 | 无 | .env + dotenv + DATABASE_URL |

### 🎯 明天计划

- 开工先**复习今天 10 个坑里的 3-5 个**(重点:`if (!)` 校验、中间件 next、`?` 占位符)
- 进 **关10:Prisma ORM** —— 解放手写 SQL,类型安全 + 自动迁移
- 预告:`prisma.task.findUnique({where:{id}})` 替代手写 SQL,爽到飞起

### 💬 一句话总结

> 从徒手 `node:http` 到 Express 分层架构到 MySQL 持久化,4 天走完了"玩具 → 工程"的完整路径。现在你写的代码结构,和真实生产项目已经没本质区别了。明天 Prisma 是这个链条上最后一块拼图——之后 NestJS 全栈你会觉得水到渠成。

---

## 2026-07-07 (Day 5) — Prisma 全家桶 + JWT 鉴权(大丰收日)

### 今日战果:3 关全绿 + 1 关半成

```
关 10 Prisma 基础 CRUD ✅  (7/7 测试通过)
关 10.5 关联关系 ✅        (6/6 测试通过,含级联删除验证)
关 11 鉴权数据层 ✅        (8/8 测试通过,注册/登录/验证全通)
关 11 中间件 ⏸            (明天接着写,就 10 行代码)
```

产出 4 个真实文件,21 步测试全绿。**单日产出最高的一天。**

### 🏆 今天最值钱的 3 个认知

#### 1. 质疑权威,用代码说话 ⭐⭐⭐(今天最值钱)

我下结论"PrismaMariaDb 不能用 url 字符串"。王 Ye 问"确定吗?",我跑实验 → **我错了**。

```
菜鸟思维:权威说不可以 → 算了照他说的拆 URL
大师思维:这结论可疑 → 跑代码验证 → 翻案
```

**工程领域没有"因为我说了",只有"代码怎么跑"**。这个习惯比学 10 个 API 都值钱。

#### 2. import type 的本质(新坑,Node 22 原生 TS 必踩)

```ts
import { Task } from './tasks_prisma.ts'       // ❌ 当值导入,运行时找 Task,炸
import type { Task } from './tasks_prisma.ts'   // ✅ 纯类型,编译期抹掉,运行时无痕
```

**规则**:interface/type 别名用 `import type`,class/function/const 用普通 import。

#### 3. 数据形状 ≠ 接口形状(map 的工程价值)

```ts
// Prisma 返回:_count.tasks(嵌套,丑)→ 对外用 taskCount(扁平,干净)
return users.map(u => ({...u, taskCount: u._count.tasks}))
```

**数据库/ORM 的字段形状不该泄漏给 API 调用方**——用 map 做适配层。NestJS 里这叫 DTO。

### 🔥 Prisma 关联关系 4 大爽点(关 10.5 核心)

| 特性 | Prisma 写法 | 手写 SQL 痛点 |
|---|---|---|
| **嵌套创建** | `create({data:{name, tasks:{create:[...]}}})` 一行建 User+Tasks+设外键 | 要 3 条 INSERT + 手动 insertId + 事务 |
| **include** | `{include:{tasks:true}}` 自动 JOIN 成嵌套 | LEFT JOIN + 手动折叠扁平结果 |
| **_count** | `{include:{_count:{select:{tasks:true}}}}` 只数不取 | `SELECT COUNT(*) GROUP BY` 巨绕 |
| **级联删除** | `delete` 一个 User,他的 Tasks 外键自动 null | 手动 UPDATE 或数据库级 ON DELETE |

### 🔐 鉴权三件套(关 11 核心)

| 动作 | API | 关键认知 |
|---|---|---|
| **加密密码** | `bcrypt.hash(明文, 10)` | 单向不可逆,数据库存 $2b$ 哈希不是明文 |
| **验证密码** | `bcrypt.compare(明文, 哈希)` | 不能"解密",只能比对 |
| **签发 token** | `jwt.sign({userId,email}, JWT_SECRET, {expiresIn:"7d"})` | JWT_SECRET 是防伪核心 |
| **验证 token** | `jwt.verify(token, JWT_SECRET)` | 无效/过期抛错,要 try/catch |

### ⚠️ 今天的坑(明天复习重点)

#### 老毛病复发统计(必须钉死)

| 老毛病 | 今天复发 | 累计 | 钉死法 |
|---|---|---|---|
| **漏 await** | 3 次(deleteTask、getAllUsersWithTaskCount、deleteUser) | **第 6-8 次** | 调返回 Promise 的函数,**默认加 await** |
| **ESM 后缀漏 .ts** | 1 次(users_prisma 第 4 行) | **第 3 次** | ESM import 必带 `.ts` 后缀 |
| **校验 if 反** | 0 次! | 第 5 次(止住) | ✅ 报错用 `!` 终于记住了 |

#### 今天新坑

- **`import type`**:interface 跨文件导入必须用,运行时整行抹掉
- **`throw null`**:throw 只扔 Error 对象(`throw new Error("...")`),别扔 null/string
- **`delete` vs `deleteMany`**:delete 找不到抛 P2025;deleteMany 返回 `{count}`
- **防枚举攻击**:login 统一返回 null,不区分"用户不存在"和"密码错"
- **register 抛错 vs login 返回 null**:业务异常用抛错,正常可能性用返回值
- **baseline 迁移**:现有数据库引入 Prisma,用 `migrate resolve --applied` 登记
- **pnpm scripts 自动注入 .bin**:不用写 `./node_modules/.bin/`,加 script 用 `pnpm xxx`

### 📈 能力跃迁

| 维度 | Day 4 | Day 5 |
|---|---|---|
| 数据访问 | 手写 SQL + `?` 占位符 | ✅ Prisma ORM,类型安全零 SQL |
| 关系建模 | 单表 | ✅ 1:N 关联、嵌套查询、级联删除 |
| 安全 | SQL 注入防御 | ✅ 密码加密 + JWT 鉴权(数据层) |
| 工程配置 | .env | ✅ schema + migrate + workspace.yaml + scripts |

### 🎯 明天计划

- 开工先**复习今天 7 个新坑**(重点:`import type`、漏 await、throw Error)
- **写完关 11 中间件**(10 行代码,串完鉴权全链路)
- 进 **阶段3:NestJS** —— 把 Express + Prisma + JWT 全部用框架重写,你会觉得水到渠成

### 💬 一句话总结

> 今天是质变日。Prisma 让你彻底告别手写 SQL,关联关系让你理解"为什么团队上了 ORM 回不去",JWT 鉴权是面试必考。但你今天最大的进步不是这些 API——是**质疑我、用代码翻案**。这个习惯会让你在真实工程里少踩 80% 的坑。明天写完中间件,直接进 NestJS,你会发现自己已经具备了 70% 的 NestJS 前置知识。

---

## 2026-07-08 (Day 6) — NestJS 五关连破日(单日最多)

### 今日战果:5 关同一天通关

```
关 11 收尾 鉴权中间件 ✅  端到端5步全绿
关 12     NestJS三件套+IoC ✅  第一个Nest模块启动
关 12.5   CRUD装饰器全套   ✅  5个接口+异常404/400/409
关 13     PrismaService注入  ✅  真MySQL持久化
关 14     JWT Guard+Strategy ✅  注册/登录/鉴权保护
```

**产出 15 个文件,从 Express 升级到 NestJS 完整全栈。**

### 🏆 今天最值钱的 3 个认知

#### 1. IoC 容器 = "点菜,厨房端上来"(⭐⭐⭐)

```
Express:你主动 new(自己买菜)—— 生命周期、依赖顺序、单例全手动管
NestJS: 你声明"我需要",框架自动注入(点菜)—— 构造签名=声明,new/单例都不管
```

**IoC 的三句话**:
1. @Injectable 贴标签 + 构造函数的类型声明 = 告诉容器"我需要什么"
2. 容器自动 new + 注入 + 管单例
3. 换实现不用改业务代码(测试时换假的进去)

#### 2. Guard = 中间件的升级版

```ts
// Express:if-else + next()(手动控制流程)
authMiddleware(req, res, next) {
  if (!token) return res.status(401).json(...)
  next()
}

// NestJS:boolean 放行(框架自动处理 401)
JwtAuthGuard extends AuthGuard("jwt") {
  // Passport 自动取 Bearer token → JwtStrategy.validate → return user → req.user
}
```

#### 3. NestJS vs 裸 Node import 规则相反

| 环境 | import 路径 | 原因 |
|---|---|---|
| 裸 Node (`--experimental-strip-types`) | **必须带 `.ts`** | 原生 ESM 规范 |
| NestJS (`tsc` 编译) | **不能带 `.ts`** | tsc 编译成 .js 再跑 |

今天 4 个文件报错 `.ts` 后缀,就是这个原因。

### 🔥 新增 4 个 NestJS 异常(记入知识库)

| 异常类 | 状态码 | 场景 | 对比 Express |
|---|---|---|---|
| `NotFoundException` | 404 | 资源不存在 | `res.status(404).json(...)` |
| `BadRequestException` | 400 | 参数不合法 | `res.status(400).json(...)` |
| `ConflictException` | 409 | 重复创建 | `res.status(409).json(...)` |
| `UnauthorizedException` | 401 | 未登录 | `res.status(401).json(...)` |

**一句话**:**不再手动 `res.status()`,直接 `throw new XXXException()`,框架自动转 HTTP 响应。**

### ⚠️ 今天踩的坑(明天复习重点)

#### 老毛病:漏 await(第 11 次复发!!)
- **login 的 `bcrypt.compare` 漏 await** → 密码错也能登录成功,鉴权形同虚设
- **findOne 的 `tasksService.findOne()` 漏 await** → 查不到也不抛 404(200 空响应)
- **钉死法**:看到 `bcrypt.compare()`、`prisma.xxx.xxx()`、`this.service.xxx()` **条件反射加 await**。不要想"这个要不要 await",默认加,除非明确知道不需要。

#### NestJS 新坑

- **`.ts` 后缀**:NestJS 用 tsc 编译,import 不能带 `.ts`(跟裸 Node 相反)
- **`.env` 加载**:NestJS 入口只有 main.ts,必须 `import "dotenv/config"`,否则 PrismaService 读不到 DATABASE_URL

### 📈 能力跃迁

| 维度 | Day 5 | Day 6 |
|---|---|---|
| 框架 | Express 散装 | ✅ NestJS 三件套 + IoC 容器 |
| 鉴权 | 手写 jwt.sign + verifyToken | ✅ JwtService + PassportGuard + Strategy |
| 异常处理 | res.status().json() | ✅ throw NotFoundException(框架自动转) |
| 代码组织 | 自由路由+控制器+数据层 | ✅ controller/service/module 强约定 |
| 面试能力 | 会用 Express | ✅ 能说 IoC/Guard/Passport/NestJS 架构 |

### 🎯 明天计划

- 开工复习今天 6 个新坑(重点:漏 await#11、.ts 后缀规则、.env 加载)
- 进 **关 15:项目部署** —— 把 NestJS 项目部署到线上,加上 Docker/PM2
- 然后你的全栈学习就完成了 85%,剩下的 15% 是在项目实战中积累

### 💬 一句话总结

> 今天是单日产出最大的一天——5 关连破,从 Express 到 NestJS 完整全栈只用了 6 天。你现在的代码结构和面试能力,已经可以投 14-18K 的全栈岗了。剩下最后一关部署,然后就是接真实项目实战打磨。明天写完关 15,这个教程就到了你的毕业时刻。


---

## 2026-07-09 (Day 7) — 阶段4 启动:关 16-17 完成 ✅

### 今日过关:2 关

| 关 | 主题 | 用时感 | 掌握度 |
|---|---|---|---|
| 16 | 全局异常过滤器 | 中 | 核心掌握,安全脱敏意识追问时偏浅 |
| 17 | 响应拦截器 | 慢 | 代码会写,pipe 顺序追问答"不清楚",补测后才通过 |

### 📚 今天学到的核心知识

1. **NestJS 组件执行顺序**(必背):`Middleware → Guard → Interceptor(前) → Pipe → Controller → Interceptor(后) → Response`,异常冒泡被 ExceptionFilter 接住。口诀 M-G-I-P-C-I-F。
2. **全局异常过滤器**:`@Catch()` 空括号兜底所有异常(含未知错误),`@Catch(HttpException)` 会漏掉 DB 炸/代码 bug → 泄露堆栈给客户端。安全红线:内部异常脱敏成固定文案,堆栈只进 `Logger.error()`。
3. **响应拦截器双向夹击**:Controller 执行前后都运行。`next.handle()` 返回 RxJS Observable,`tap` 看数据不改(打日志),`map` 改造数据(包壳成 `{code,message,data}`)。
4. **过滤器管失败,拦截器管成功**:异常让 Observable 进入 error 状态断流,`map` 不执行,异常直接冒泡到过滤器。这是两者分工的技术原理。
5. **RxJS pipe 顺序**:`pipe` 从左到右串联,前一个操作符的输出 = 后一个操作符的输入。`tap` 在 `map` 前看到原始数据,在后看到包壳后的数据。

### 🔥 今天踩过并记住的坑

1. **改 main.ts 漏注册过滤器**(关17):加 `app.useGlobalInterceptors(...)` 时手滑覆盖了 `app.useGlobalFilters(...)` → 异常回到 NestJS 默认格式。教训:改完全局组件要数一遍 Filters+Interceptors+Pipes 都在。全局组件**注册才生效**,文件存在不注册 = 死代码。
2. **pnpm 11 审批拦截(第 3 次)**:改 `pnpm-workspace.yaml` 不够,必须跑 `pnpm approve-builds`。`pnpm run start` 底层触发 deps 检查,未审批直接退出。绕过法:直接 `npx tsc + node dist/main.js`。nest-app 的 workspace yaml 还漏了 `prisma`(已补)。
3. **host.docker.internal vs localhost**:本地直跑 node 要用 localhost,Docker 内才用 host.docker.internal。今天 MySQL pool timeout 就是 host 写错。

### 🎯 追问盲区(明天复习重点)

- [ ] **`@Catch()` 空括号 vs `@Catch(HttpException)` 的后果** —— 答出"漏掉未知错误"但没说清"会泄露堆栈"
- [ ] **exception.stack 泄露的危害** —— 只答"拿到信息",没说出文件路径/依赖版本/SQL 片段等具体情报
- [ ] **RxJS pipe 顺序** —— 直接答"不清楚",补讲 + 补测后通过

### 📈 能力跃迁

| 维度 | Day 6 | Day 7 |
|---|---|---|
| 响应规范 | 裸数据 + NestJS 默认错误格式(三套长相) | ✅ 统一 `{code,message,data}` 成功失败一套 |
| 异常处理 | throw 异常类(框架转) | ✅ 自定义全局过滤器,脱敏 + 日志双全 |
| 组件认知 | Guard/Pipe/Module | ✅ 补齐 Interceptor + Filter,6 大组件全掌握 |

### 🎯 明天计划

- 开工先复习:三个追问盲区(`@Catch()` 空括号后果、stack 泄露危害、pipe 顺序)
- 进 **关 18:自定义管道(Pipe)** —— ParseIntPipe 替代手写 Number()+判NaN
- 后续:关 19 RBAC 权限 → 关 20 Swagger → 关 21 @CurrentUser → 关 22-25 Redis 实战

### 💬 一句话总结

> 今天打开了阶段 4"NestJS 进阶"的大门。关 16-17 是配对的两半——过滤器管失败、拦截器管成功,合起来把 API 响应规范统一成 `{code,message,data}`。代码都自己写、自己测、自己修了 bug(漏注册过滤器)。pipe 顺序这个盲区补测过关,说明追问机制在起作用——答"不清楚"就补讲到会为止,不蒙混过关。明天复习三个盲区后继续关 18。

---

## 2026-07-16 (Day 12) — Kafka 收尾 + 项目实战开局:关 28-31 完成 ✅

### 今日过关:4 关(跨阶段:阶段5收尾 + 阶段6开局)

| 关 | 主题 | 用时感 | 掌握度 |
|---|---|---|---|
| 28 | Kafka 集成实战 | 中 | kafkajs API + 单节点 replication factor 坑 |
| 29 | 数据建模 Article + Comment | 快 | 1:N 建模、双向关联、author 语义化命名 |
| 30 | 文章 CRUD API | 慢 | 分页 skip+take、select 过滤 password、权限判断顺序 |
| 31 | 文章缓存 + 排行榜 | 中 | Cache-Aside 复用、delByPattern、排行榜 zIncrBy |

### 📚 今天学到的核心知识

1. **Kafka producer/consumer**:producer.send(topic, messages)、consumer.connect + subscribe(fromBeginning) + run(eachMessage)。Kafka 不用 ack,自动提交 offset。
2. **单节点 Kafka replication factor 坑**:默认 replicas=3,单节点无法创建 `__consumer_offsets` → 消费者组协调器不可用。必须设 `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1`。
3. **Consumer Group 同组 vs 不同组**:同组分摊消费(每条只被一个消费者收),不同组各自消费全部。
4. **Prisma 关联双向绑定**:两边必须同时声明,少一边直接编译报错(不是带不出数据)。
5. **Prisma select 过滤敏感字段**:`include: { author: { select: { id: true, name: true } } }` 过滤掉 password。
6. **深度分页性能**:OFFSET 越大越慢(MySQL 要扫描丢弃前面的行)。游标分页(`WHERE id > lastId`)恒定快。
7. **权限判断顺序**:先存在性(404)→ 再权限(403)。文章不存在时不能抛 403。
8. **缓存 key 包含分页参数**:`article:list:${page}:${pageSize}`,不同页缓存不同。
9. **写操作删缓存策略**:create 只删列表缓存(新文章 detail 缓存不存在);update/remove 删 detail 缓存。
10. **Redis del 不支持通配符**:`del("article:list:*")` 只删字面 key,要用 `delByPattern`(先 KEYS 再批量 del)。

### 🔥 今天踩过并记住的坑

1. **Kafka Group coordinator not available**(关28):单节点 replication.factor 默认 3,设成 1 解决。
2. **kafkajs Logger 不能注入**(关28):Logger 不是 @Injectable,必须 `new Logger()`。
3. **拼写 kafaka → kafka**(关28):注入名拼错,TS 自洽不报错但是规范问题。
4. **DTO @IsEmpty 写反**(关30):应该是 @IsNotEmpty。IsEmpty = "必须为空",逻辑完全反了。
5. **findOne 没过滤 password**(关30):include author 时没加 select,密码泄露。
6. **拼写 cache 反复写错**(关31 第6次):cashe/casha,全项目最顽固的拼写问题。
7. **Redis del 通配符**(关31):del 不支持 `*`,要用 keys + 批量 del。
8. **remove 参数不匹配**(关30):Controller 传 3 个参数,Service 只收 1 个,运行报错。

### 🎯 追问盲区(明天复习重点)

- [ ] **Kafka 单节点 replication factor**(今天抽考答错,答成 groupId)
- [ ] **深度分页游标方案**(OFFSET 为什么慢)
- [ ] **缓存一致性:create 不删 detail 缓存的原因**

### 📈 能力跃迁

| 维度 | Day 11 | Day 12 |
|---|---|---|
| 消息队列 | RabbitMQ | ✅ + Kafka(阶段5全通) |
| 项目实战 | 无 | ✅ 博客平台 Article 模块(CRUD+缓存+排行) |
| 数据建模 | 只有 Task | ✅ Article + Comment 1:N 建模 |

### 🎯 明天计划

- 开工先复习三个盲区(Kafka replication factor、游标分页、缓存一致性)
- 进 **关 32:评论功能**(Comment 模块,跟 Article 结构类似)
- 后续:关 33 MQ 整合 → 关 34 限流 → 关 35 Vue 前端 → 关 36 联调收尾

### 💬 一句话总结

> 今天从「学技术」正式跨进「用技术搭产品」。阶段 5 消息队列用 Kafka 收尾全绿,阶段 6 博客平台一口气做了数据建模+CRUD+缓存+排行榜四关。最值钱的认知:学过的 Cache-Aside / 排行榜 / 穿透防护全部能复用到新模块上——这说明你不是在"背 API",而是真的掌握了模式。拼写问题(cache/cashe)反复出现 6 次还没根除,明天必须钉死。

---

## 2026-07-15 (Day 11) — RabbitMQ 实战 + Kafka 启动:关 26-27 完成 ✅

### 今日过关:2 关(阶段 5 消息队列)

| 关 | 主题 | 用时感 | 掌握度 |
|---|---|---|---|
| 26 | 消息队列概念 + RabbitMQ 集成 | 中 | MQ 三大作用、RabbitMQ vs Kafka 选型理解到位 |
| 27 | RabbitMQ Fanout Exchange 实战 | 慢 | 三消费者广播跑通,生命周期钩子踩坑深 |

### 📚 今天学到的核心知识

1. **消息队列三大作用**:① 异步解耦(耗时操作丢队列,立即响应)② 削峰填谷(突发流量排队)③ 服务解耦(生产者不管消费者是谁)
2. **RabbitMQ vs Kafka 选型**:业务消息(订单/邮件)选 RabbitMQ(灵活路由),数据流(日志/行为追踪)选 Kafka(高吞吐+可回放)
3. **RabbitMQ 模型**:Producer → Exchange(路由)→ Queue → Consumer。生产者不直连队列,Exchange 决定往哪路由。
4. **Exchange 四种类型**:
   - Fanout:广播,所有绑定的队列都收
   - Direct:精确匹配 routing key
   - Topic:模式匹配(`*` 一个词,`#` 多个词)
   - Headers:按消息头(很少用)
5. **ack(消息确认)**:消费者处理完必须 `channel.ack(msg)`,否则消息卡在 Unacked 状态。不 ack 的消息在消费者断开后才重新投递。
6. **消费异常处理**:消费逻辑必须 try-catch,否则坏消息让消费者卡死。生产用 try-catch + ack(丢弃坏消息记日志)或死信队列(DLX)重试。
7. **Kafka 核心概念**:
   - Topic:主题(对标 RabbitMQ 队列,但消息不删)
   - Partition:分区,并行处理
   - Consumer Group:消费者组,同组分摊,不同组各自消费
   - offset:偏移量,消费者记住「读到哪了」,可重放
8. **Kafka vs RabbitMQ 本质区别**:RabbitMQ 消费即删(新消费者收不到历史);Kafka 消息留存(新消费者可 `fromBeginning: true` 从头消费/回放)
9. **NestJS 完整生命周期**(踩坑后补讲):
   - 启动:`onModuleInit`(子模块先)→ `onApplicationBootstrap`(全局就绪)→ `app.listen`
   - 关闭:`onModuleDestroy` → `beforeApplicationShutdown` → `onApplicationShutdown`
   - **铁律:依赖别人(连接/消费者)用 `onApplicationBootstrap`,释放资源用 `onModuleDestroy`**

### 🔥 今天踩过并记住的坑

1. **消费者 onModuleInit 拿到 undefined channel**(关26):子模块的 `onModuleInit` 先于根模块执行 → `connect()` 还没跑 → channel 是空的。改用 `OnApplicationBootstrap` 解决(所有模块初始化后才跑)。
2. **队列名不一致**(关26):生产者写 `task:created`(冒号),消费者写 `task.created`(点号)→ 消息发出去没人收。RabbitMQ 用**点号**命名(跟 Redis 冒号相反)。
3. **新消费者没注册到 Module**(关27):`SmsConsumer`/`StatsConsumer` 写了但没加到 `providers`,NestJS 不实例化 → `onApplicationBootstrap` 不执行。改 providers 数组解决。
4. **改代码后没重启**(关27):watch 模式对新增文件有时不自动刷新,手动 Ctrl+C 重启才识别新消费者。排查依据:RabbitMQ 管理界面看队列数/消费者数。
5. **amqplib 2.x API 变更**(关26):`connect()` 返回 `ChannelModel` 不是 `Connection`,大版本升级 API 变了,TS 报错。查 `index.d.ts` 真实类型修正。
6. **RedisModule import 路径错**(关26):`import { RedisModule } from './redis/redis.service'` 应该从 `.module` 导入。

### 🎯 追问盲区(明天复习重点)

- [ ] **ack 删掉会怎样**(关26 Q1):不只是重启才重投,更直接的是消息卡在 Unacked 状态不释放
- [ ] **消费异常必须 try-catch**(关26 Q2):不 try-catch 的话 ack 不执行,消息卡死
- [ ] **NestJS 生命周期顺序**(关26 踩坑):子模块 onModuleInit 先于根模块,消费者用 onApplicationBootstrap
- [ ] **Kafka offset 回放机制**(关28 刚学):fromBeginning 的含义

### 📈 能力跃迁

| 维度 | Day 10 | Day 11 |
|---|---|---|
| 消息队列 | 无 | ✅ RabbitMQ 生产者/消费者 + Fanout 广播 |
| 系统架构 | 同步调用 | ✅ 异步解耦(创建任务 → 多服务广播通知) |
| NestJS 生命周期 | 只用 onModuleDestroy | ✅ 掌握完整 5 个钩子 + 执行顺序 |

### 🎯 明天计划

- 开工先复习四个盲区(ack 行为、try-catch、生命周期、offset)
- **写完关 28:Kafka 集成**(KafkaService 已搭好,生产者/消费者待写)
- 关 28 写完 = 阶段 5 消息队列全部通关

### 💬 一句话总结

> 今天从「同步世界」跨进「异步世界」。最值钱的认知是:消息队列不是"更快",而是"解耦"——用户不等邮件、TaskService 不管邮件服务死活。踩的生命周期坑(onModuleInit 拿到 undefined channel)是 NestJS 最经典的异步初始化问题,记住"依赖别人用 onApplicationBootstrap"就够了。Fanout 三消费者广播跑通那一刻,你应该感受到 RabbitMQ 路由的威力——一条消息,三个服务各自消费。明天 Kafka 补齐,消息队列这块就完整了。

---

## 2026-07-13 (Day 9) — Redis 缓存三连击:关 22-24 完成 ✅

### 今日过关:3 关(阶段 4 下半场,Redis 实战)

| 关 | 主题 | 用时感 | 掌握度 |
|---|---|---|---|
| 22 | Redis 集成 + 缓存策略 | 中 | Cache-Aside 流程一次答对,代码自己写 |
| 23 | 缓存三大问题防护 | 慢 | 穿透/击穿/雪崩全写全测,击穿锁逻辑改了两轮 |
| 24 | 限流拦截器(滑动窗口) | 中 | 代码写对但「没吃透」,用数数题才打通 |

### 📚 今天学到的核心知识

1. **Cache-Aside(旁路缓存)模式**:先查缓存 → 命中返回 → 未命中查 DB → 写回缓存 + 设 TTL。
2. **缓存穿透**:查不存在的数据,缓存永远写不进去 → 每次打 DB。**解法:缓存空对象**(短 TTL 30s)。
3. **缓存击穿**:热 key 过期瞬间,海量请求同时打 DB → MySQL 挂。**解法:分布式锁单飞**(SET NX,抢到锁的查 DB,没抢到的轮询等缓存)。
4. **缓存雪崩**:大量 key 同时过期 → DB 被多接口同时轰炸。**解法:TTL 随机抖动**(`60 + random(30)`)。
5. **滑动窗口限流**:用 Redis Sorted Set,每个请求按时间戳存(score=时间)。三步:清旧 → 计数 → 判断。窗口右边界永远是「现在」。
6. **Sorted Set vs 计数器**:计数器是「固定窗口」,边界处会翻倍(59秒10次+61秒10次=2秒20次);Sorted Set 记住每个请求时间戳,精确剔除过期的,真滑动。
7. **Guard 执行顺序**:`@UseGuards(A, B)` 按数组顺序。**限流应前置**——挡在最外层,连验 token 都不让做,保护后面所有资源。
8. **ioredis 类型都是 string**:Redis 没有数字类型,`zincrby` 返回 `"50"`(字符串),`zrevrange WITHSCORES` 返回扁平数组 `["1","50","2","30"]` 不是元组数组。

### 🔥 今天踩过并记住的坑

1. **拼写 cache → cash/cashe**(关22-23 反复):`cashData`(现金?)、`CACH_KEY`(少 E)、`casheData`、`taks_${id}`(拼错)。**英语要记准:cache 缓存 / cash 现金**。
2. **击穿锁逻辑漏洞**(关23 第一版):写成 `if(!lock){等} 查DB` —— 不管抢没抢到锁都查 DB,锁白加。**正确结构是 if/else 互斥**:抢到锁的查 DB + try/finally 释放锁,没抢到的只等缓存绝不查 DB。
3. **fire-and-forget 的 set 没加 await**(关22):生产可接受但不 await 时 Redis 挂了会报 unhandled rejection。关 23 讲了缓存异常处理。
4. **空值缓存漏了 TTL**(关23 第一版):`set(key, "null")` 只传两参数,空值永不过期 → 这个 id 后来被创建了也拿不到。**空值 TTL 要短(30s)**。
5. **滑动窗口右边界算错**(关24 追问):脑子里把窗口右边界想成「60秒」,丢掉了「现在=90秒」。**窗口 = [现在-60秒, 现在],右边界永远是「现在」**。用数数题(第85秒窗口内有几个请求)才打通。
6. **ioredis 返回类型写错**(关25):`zincrby` 返回 `string` 不是 `number`;`zrevrange WITHSCORES` 返回扁平 `string[]` 不是 `[string,string][]`。TS 报红才查类型定义。

### 🎯 追问盲区(明天复习重点)

- [ ] **Sorted Set vs 计数器**(关24 Q3 答「不清楚」)——已补讲,明天抽查「固定窗口边界翻倍」
- [ ] **滑动窗口右边界 = 现在**(关24 算错过)——再出一道数数题
- [ ] **击穿锁的 if/else 互斥结构**(关23 第一版写漏)——为什么不能都走到查 DB

### 📈 能力跃迁

| 维度 | Day 8 | Day 9 |
|---|---|---|
| 数据层 | 单 MySQL | ✅ MySQL + Redis 双层缓存 |
| 高并发防护 | 无 | ✅ 穿透/击穿/雪崩三防 + 滑动窗口限流 |
| Redis 能力 | 无 | ✅ String 缓存 + SET NX 分布式锁 + Sorted Set 限流 |

### 🎯 明天计划

- 开工先复习三个盲区(Sorted Set vs 计数器、滑动窗口右边界、击穿锁结构)
- **写完关 25:Redis Sorted Set 排行榜**(今天刚加完 zIncrBy/zRevRange,completeTask + getRanking + 两个接口待写)
- 关 25 写完 = 阶段 4 全部通关 🎉

### 💬 一句话总结

> 今天从「只会查 MySQL」升级到「MySQL + Redis 双层存储」。最值钱的不是 API,而是吃透了缓存三大问题的**为什么**——穿透是「查不到就不缓存」、击穿是「大家都去查」、雪崩是「同时过期」。限流那关代码写对了但「没吃透」,用一道数数题才把滑动窗口的右边界钉死。明天写完排行榜,阶段 4 就全绿了。

---

## 2026-07-10 (Day 8) — NestJS 进阶全通关:关 16-21 完成 ✅

### 今日过关:6 关(单日新高)

| 关 | 主题 | 用时感 | 掌握度 |
|---|---|---|---|
| 16 | 全局异常过滤器 | 快(复习) | @Catch() instanceof 机制连续 3 次盲区,已补讲 |
| 17 | 响应拦截器 | 快(补测) | pipe 顺序补测通过 |
| 18 | 自定义管道 | 中 | NaN bug 暴露 ValidationPipe.transform 副作用 |
| 19 | RBAC 角色权限 | 慢 | 核心做对,404/401 概念混淆已纠正 |
| 20 | Swagger 文档 | 快 | 404 是端口占用坑,非代码问题 |
| 21 | @CurrentUser 装饰器 | 快 | 一次过,概念清晰 |

### 📚 今天学到的核心知识(6 大组件全覆盖)

1. **NestJS 6 大组件执行顺序**(必背):`Middleware → Guard → Interceptor(前) → Pipe → Controller → Interceptor(后)`,异常冒泡被 ExceptionFilter 接住。口诀 M-G-I-P-C-I-F。
2. **全局异常过滤器**:`@Catch()` 空括号用 `instanceof` 兜底所有异常(含未知 Error),脱敏不泄露堆栈。
3. **响应拦截器**:Controller 前后双向夹击,`tap` 打日志/`map` 包壳。异常让 Observable 断流跳过 map,落到过滤器。
4. **RxJS pipe 顺序**:从左到右,前一步输出 = 后一步输入。
5. **自定义管道**:`PipeTransform.transform(value)`。内置 `ParseIntPipe` 管单参数转换,自定义 Pipe 管业务规则。
6. **ValidationPipe.transform 副作用**:会提前把单参数 "abc" 转成 NaN,搞乱自定义 Pipe。单参数转换用内置 ParseIntPipe。
7. **RBAC**:`@Roles` + `RolesGuard` + `Reflector` 存取元数据。JwtStrategy 查库取 role 挂 req.user。
8. **401 vs 403 vs 404**:401 没登录/403 没权限/404 资源不存在。口诀"你是谁/你不能/没这东西"。
9. **Swagger**:`DocumentBuilder` 配置 + `SwaggerModule.setup` + `@ApiTags/@ApiOperation` 装饰器。改 main.ts 必须手动重启。
10. **@CurrentUser()**:`createParamDecorator` 只返回 user,替代 @Req() 整个 request,解耦 Controller。

### 🔥 今天踩过并记住的坑

1. **改 main.ts 漏注册过滤器**(关17):加拦截器时覆盖了 useGlobalFilters → 全局组件注册才生效。
2. **ValidationPipe 把 "abc" 转成 NaN**(关18):transform:true 对单参数的副作用,用内置 ParseIntPipe 解决。
3. **RolesGuard `return false` 锁死项目**(关19):没贴 @Roles 的接口应 return true 放行。
4. **404 和 401 概念混淆**(关19):"查询不到数据"是 404 不是 401,已纠正。
5. **Swagger 404 是端口占用**(关20):旧进程占 3000,改完没重启命中的是旧进程。
6. **prisma db execute 表名转义坑**(关19):反引号转义不对导致 SQL 静默失败,改数据用 prisma.user.update。

### 🎯 追问盲区(明天复习重点)

- [ ] **`@Catch()` 用 `instanceof` 判断**(连续 3 次盲区,明天必抽查这个词)
- [ ] **401/403/404 区别**(答错过,已纠正)
- [ ] **没 Guard 时 @CurrentUser 拿到 undefined**(Q3 漏答)

### 📈 能力跃迁

| 维度 | Day 7 | Day 8 |
|---|---|---|
| NestJS 组件 | Filter + Interceptor(2/6) | ✅ 6 大组件全掌握 |
| 权限控制 | 登录/没登录两层 | ✅ RBAC 三层(401/403/200) |
| API 规范 | 统一响应格式 | ✅ + Swagger 可交互文档 |
| Controller 解耦 | @Req() 拿整个 request | ✅ @CurrentUser() 干净注入 |

### 🎯 明天计划

- 开工先复习三个盲区(@Catch instanceof、401/403/404、@CurrentUser undefined)
- 进 **关 22:Redis 集成 + 缓存策略** —— 阶段 4 下半场开始
- 先确认 Redis 环境(brew install redis / 启动)

### 💬 一句话总结

> 今天单日破 6 关,NestJS 6 大组件全部学完——从异常处理到 RBAC 权限到 Swagger 文档到自定义装饰器,一个生产级后端该有的能力都具备了。最值钱的是踩了 6 个真实坑(漏注册/transform 副作用/return false/概念混淆/端口占用/SQL 转义),这些都是面试和实战才会遇到的。明天进 Redis 实战,把缓存/限流/排行榜补上,后端深度就到位了。

---

## 2026-07-23 (Day 14) — VSCode 断点调试 + 事务入门:关 37-38、41 完成 ✅ / 关 42 未完 🔶

### 今日产出

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 37 | VSCode 断点调试 NestJS | ✅ | launch.json 要写 nvm 全路径(VSCode 不走 nvm 的 shell profile);Variables/Call Stack/Debug Console;F10 跳过/F11 进入 |
| 38 | 断点调试实战 | ✅ | 条件断点/Logpoint;Debug Console 查 Redis;排查出 update() 没删 `article:list:*` 列表缓存的 bug;Controller 里 `this.redis` 是 undefined 要走 `this.articleService.redis` |
| 39-40 | 单元测试 | ⏭️ 跳过 | 用户选择跳过,后续有需要再补 |
| 41 | 事务概念 + Prisma `$transaction` | ✅ | ACID;简单数组 `$transaction([...])` vs 交互式 `$transaction(async (tx) => {...})`;事务里只放 DB 操作 |
| 42 | 事务实战(批量创建文章) | 🔶 **未完** | DTO+Service+Controller 都写了,review 出**漏 await(第 12 次!)**,还没实测验证就下班 |

### 🔥 今天踩过并记住的坑

1. **launch.json `npx` 找不到**(关37):VSCode 启动子进程不加载 `.zshrc`,nvm 的 node 不在 PATH。改写全路径 `/Users/.../nvm/.../v22.22.0/bin/npx`。
2. **Debug Console 返回 pending Promise**(关38):`this.redis.get()` 是 async,Debug Console 里要写 `await this.redis.get(...)` 才拿得到值。不加 await 拿到的是 `Promise { <pending> }`。
3. **Controller 里 `this.redis` 是 undefined**(关38):RedisService 没注入到 Controller,要走 `this.articleService.redis`。
4. **🔥 `batchCreate` 里 `tx.article.create()` 漏 await(第 12 次!)**(关42):不加 await,push 的是 Promise 不是文章;COMMIT 时序不可控,可能全进/进几个/一个没进;返回给前端序列化成 `[{}, {}]`。**这是最高频盲区,改成每天抽。**

### 🎯 追问盲区(明天复习重点)

- [ ] **🔥 漏 await 条件反射**(第 12 次踩,且今天答含糊)—— 改成每天抽,连对 3 次才回 3 天轮
- [ ] **import 后缀两套规则**(答"Nest 内部处理了"含糊)—— 补考:tsc 编译后 .ts 后缀变什么路径
- [ ] **$transaction 两种写法**(只说"能不能判断"没说代码形态)—— 补考:各写一行调用

### 📈 能力跃迁

| 维度 | Day 12 | Day 14 |
|---|---|---|
| 调试能力 | console.log 党 | ✅ VSCode 断点 + Variables + Debug Console |
| 数据库 | 单条 CRUD | ✅ 事务(原子性/隔离性),知道简单 vs 交互式两种事务 |
| 工程思维 | 能写代码 | ✅ 能用断点排查真实 bug(发现 update 漏删列表缓存) |

### ⚠️ 未完成项

- **关 42 batchCreate 的 await bug 没实测验证**。明天第一件事:
  1. 测加 await 版 → 返回 3 篇完整文章对象
  2. 测不加 await 版 → 返回 `[{}, {}, {}]`
  3. 两个结果贴给我对比

### 🎯 明天计划

- 开工先**实测关 42 的 await bug**(补今天的债)
- 关 42 通关后进 **关 43:N+1 查询问题 + 优化**
- SPACED_REVIEW 一堆逾期项要补抽(关 2/16/17/18/19/23/6/9/11)

### 💬 一句话总结

> 今天最大的认知变化:从"出 bug 就 console.log 瞎猜"升级到"打断点看 Variables 面板和 Call Stack"——这是前后端思维的分水岭,前端习惯了浏览器 DevTools,后端的 DevTools 就是 VSCode debugger。但代价是**漏 await 第 12 次踩坑**,说明这个坑还没形成条件反射,明天必须实测到底。

---

## 2026-07-28 (Day 15) — 事务实战通关 + N+1/深分页 + ES 概念:关 41-44 完成 ✅

### 今日产出

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 41 | 事务概念(补考) | ✅ | 补考过关:$transaction([...]) 简单数组 vs $transaction(async(tx)=>{}) 交互式 |
| 42 | 事务实战(批量创建文章) | ✅ | **🔥 实测验证漏 await(第12次)**:不加await返回[{},{}]且DB一条没进;加await返回3篇完整文章;any吃掉类型保护(标Article[] tsc会拦) |
| 43 | N+1 + 深分页 | ✅ | N+1用include联表一次查完(嵌套include:文章带评论带评论人);select白名单脱敏password vs include关联加载;深分页OFFSET扫描丢弃→游标分页WHERE id>lastId |
| 44 | ES 概念 | ✅ | LIKE %开头索引失效(B+树无法定位)、无相关度排序、中文分词差;倒排索引=词找文档;ES index=MySQL表 |
| 45 | ES 集成 | ⏸️ 暂停 | 讲了双写 vs MQ异步同步架构,用户决定明天接着学 |

### 🔥 今天最关键的一刻:关 42 实测验证

这是**第12次**踩漏await的坑,但今天终于用真实数据把理论落地:

| 版本 | 返回给前端 | 数据库实际 |
|------|-----------|-----------|
| ❌ 不加 await | `[{}, {}, {}]` | **一条没进** |
| ✅ 加 await | 3 篇完整文章 | 3 条都进 |

机制:
1. `tx.article.create()` 漏await → push进数组的是Promise
2. 回调return数组(不是Promise) → Prisma await非Promise立即resolve → 执行COMMIT
3. 此时INSERT请求还在网络飞 → 事务结束 → INSERT被丢弃
4. **await的真正作用:在COMMIT之前保证所有DB操作都执行完**

### 🔥 今天踩过并记住的坑

1. **漏await(第12次,但这次实测了)**(关42):见上表。这次应该真的记牢了——不是"返回不对"这么轻飘飘,是COMMIT时序不可控DB可能一条没进。
2. **`any` 吃掉类型保护**(关42):`const createdArticle: any = []` 让tsc闭嘴,漏await的bug漏到运行时。标`Article[]`后,push Promise时tsc会报错拦下。**any是逃生舱不是默认选项**。
3. **倒排索引方向说反**(关44):第一次答成"文档找词"(这是正排!),补考纠正:倒排=词找文档。

### 🎯 追问盲区(明天复习重点)

- [ ] **any 陷阱:tsc 拦 bug**(今天答含糊)—— 补考
- [ ] **select vs include 区别**(今天答含糊)—— 补考:select白名单脱敏 vs include联表
- [ ] **漏await truthy 陷阱**(今天没说透)—— Promise被当truthy,鉴权漏await形同虚设

### 📈 能力跃迁

| 维度 | Day 14 | Day 15 |
|---|---|---|
| 数据库 | 单条CRUD + 事务概念 | ✅ 事务实战 + N+1优化 + 深分页 + 搜索引擎概念 |
| 实证思维 | 实测了Debug Console | ✅ 用实测验证了漏await理论(DB实际进0条) |
| 类型安全 | 知道有tsc | ✅ 理解any的危险,标具体类型让tsc拦bug |

### 🎯 明天计划

- 开工先补考3题:① any→tsc拦bug ② select vs include ③ 漏await truthy陷阱
- **关 45:ES 集成 NestJS**(决定动手做,不只学概念)
  - ES 环境(Docker)
  - 双写 vs MQ异步同步方案选型
  - 文章搜索接口

### 💬 一句话总结

> 今天最大的认知变化:**"知道"和"实测验证过"是两个档次**。漏await踩了12次,前面11次都是"知道但不长记性",今天用真实DB数据(0条 vs 3条)验证后,这个坑终于从"知识"变成了"肌肉记忆"。同样,N+1的include联表、ES的倒排索引,都是"动手测过才真懂"。这就是为什么训练协议写"每段代码必须实测验证,不靠脑补"——脑补的知识面试一追问就垮。

---

## 2026-07-29 (Day 16) — ES 环境搭建 + 中文分词实战:关 45 进行中 🔶

### 今日产出

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 41-44 | 事务+N+1+ES概念(补考) | ✅ | 开工复习过关:漏await(return数组)、select脱敏、truthy陷阱、倒排索引 |
| 45 | ES 集成 NestJS | 🔶 进行中 | ES Docker环境搭好 + ik中文分词跑通 + 搜索验证通过;NestJS集成明天做 |

### 🔥 今天亲手做出来的东西(全是实测)

1. **ES Docker 环境搭建**:`docker-compose-es.yml`,关键配置 `discovery.type=single-node`(单节点)+ `xpack.security.enabled=false`(关认证学习用)+ `ES_JAVA_OPTS=-Xms512m -Xmx512m`(限制内存)
2. **ES REST API 实操**:用 curl 建index(PUT=建表)、写文档(POST=INSERT)、搜索(_search)、分析分词(_analyze)
3. **standard 分词器实测**:"Learn Node.js Express" → ["learn","node.js","express","and","nestjs"],**Node.js点号没拆开**(字母间点号不切)
4. **中文分词灾难亲眼看到**:standard 对 "学习全栈开发教程" → 单字切分(学|习|全|栈|开|发|教|程),全是噪音
5. **ik 分词器安装**:`docker exec ... --batch`(非交互环境跳过确认)+ `docker restart` 重启生效
6. **ik_max_word 实测**:"学习全栈开发教程" → ["学习","全","栈","开发","教程"],按词切分(比单字强太多)
7. **搜索验证通过**:DSL match 搜"全栈开发"命中,score 2.68,相关度排序正常

### 🔥 今天踩过并记住的坑

1. **ik 插件安装报"unable to read from standard input"**(关45):`docker exec` 默认不带交互终端,插件要确认 y/N 读不到。解法:`--batch` 参数自动回 yes。
2. **中文 URL 编码坑**(关45):`curl "url?q=全栈开发"` 中文没编码 → ES 收到乱码 → 0命中。解法:`-G --data-urlencode "q=全栈开发"` 自动编码,或用 DSL JSON 查询(推荐,集成 NestJS 时用)。
3. **🔥 重建 index 清空数据**(关45):`DELETE articles` + `PUT articles` 重建表结构,但忘了重新 POST 写文档 → count=0 搜不到。**重建 index = 删表建表,数据全没,要重新写。**
4. **ES _count 显示 0 但 _search 能搜到**:刚写入的文档还没 refresh(默认1秒),count走统计搜不到,search走近实时segment能搜到。ES的refresh机制。

### 🎯 追问盲区(明天复习重点)

- [ ] **🔥 standard 对 Node.js 分词**(亲手测了还答错!)—— 点号没拆开,字母间不切。必补考
- [ ] **🔥 ik_max_word vs ik_smart 方向**(答反了)—— max=最多词=最细切分,smart=智能少切。索引用max召回高,搜索用smart精确
- [ ] **ES 重建 index 清数据**(答含糊)—— DELETE+PUT=删表建表,数据全没

### 📈 能力跃迁

| 维度 | Day 15 | Day 16 |
|---|---|---|
| ES 认知 | 只懂倒排索引概念 | ✅ 亲手用 curl 跑通建index/写文档/搜索/分词分析 |
| 中文搜索 | 只知道要分词 | ✅ 实测standard单字灾难 + ik按词切分,理解为什么必须ik |
| 排查能力 | 看报错就问 | ✅ 自己用 _analyze/_count/_mapping 一步步定位"搜不到"原因 |

### 🎯 明天计划

- 开工先补考3题:① standard对Node.js分词 ② ik_max_word vs ik_smart ③ 重建index清数据
- **关 45 下半场:ES 集成 NestJS**
  - 装 ES 客户端库(@elastic/elasticsearch)
  - 我给 SearchService 骨架,你写:建index方法 + 搜索方法
  - 搜索接口:`GET /articles/search?keyword=xxx`
  - 数据同步方案:发文章时发消息到 RabbitMQ/Kafka → 消费者异步写 ES

### 💬 一句话总结

> 今天最大的认知变化:**"看了 ≠ 记住了"**。standard 分词器把 Node.js 怎么切,你亲手跑 `_analyze` 看到了结果——但下班抽考还是答错。这就是主动回忆的价值:你以为看一眼就记住了,其实没有。必须逼自己"想出来"(抽考),知识才真正进脑子。这就是为什么训练协议里下班总结要提问闭卷,而不是念笔记。

---

## 2026-07-31 (Day 17) — ES 集成全链路打通:关 45 完成 ✅

### 今日产出

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 44 | ES 概念(补考) | ✅ | 补考过关:standard对Node.js点号不拆、ik_max_word切细/ik_smart少切、重建index清数据 |
| 45 | ES 集成 NestJS | ✅ | **全链路打通**:ES环境+ik分词+搜索接口+MQ异步同步,发文章→搜到,端到端验证通过 |

### 🔥 今天完整做出来的东西(简历级)

**博客集成 Elasticsearch 全文搜索**:
1. **ES 基础设施**:`ElasticsearchService` 封装 `@elastic/elasticsearch` 客户端,`@Global` 模块全局共享
2. **搜索服务**:`ArticleSearchService` 三个方法(自己写的):
   - `ensureIndex`:建 articles index,配 ik_max_word 索引 + ik_smart 搜索
   - `indexArticle`:写文档到 ES,用 MySQL id 作 ES _id
   - `search`:multi_match 同时搜 title+content,返回扁平结构+score
3. **搜索接口**:`GET /articles/search?keyword=xxx`,路由顺序放对(search 在 :id 前)
4. **MQ 异步同步**(RabbitMQ Fanout):
   - `create()` 发消息到 `article.events` exchange(复用已有的,只加了 content 字段)
   - `ArticleSearchConsumer` 消费消息 → 调 `indexArticle` 写 ES
   - **一条消息两个消费者**(通知消费者 + 搜索同步消费者),各自独立
5. **端到端验证**:发文章(id=29)→ 2秒后搜"ES同步测试" → 命中,score 3.24 ✅

### 🔥 今天踩过并记住的坑

1. **ES 客户端版本不匹配**(关45):`@elastic/elasticsearch@9.x` 客户端发 `compatible-with=9` 请求头,但 ES 8.13.4 服务端只认 7/8 → 报 `media_type_header_exception`。9.x 客户端没有兼容配置项 → **降级到 8.x 匹配服务端**。教训:客户端和服务端主版本必须一致。
2. **500 错误被脱敏**(关45):搜索接口报 500,但 AllExceptionsFilter 把真实错误脱敏成"服务器内部错误"。排查时用 `node -e` 直接调客户端拿到真实堆栈(关 37 学的断点调试思维)。**报错要查真实堆栈,不能只看脱敏文案。**
3. **`indexArticle` 漏 await(第13次!)**(关45):消费者里 `indexArticle` 没 await 就 ack → 消息被标记"已处理"但 ES 可能没写成功 → **消息丢失+ES没入库**。await 的作用:保证写ES完成后再ack,保证消息可靠性。
4. **watch 模式降级依赖不自动跟上**(关45):`pnpm remove` + `pnpm add` 降级依赖后,`start:dev` 的 watch 没重启 → 服务挂了。手动重启解决。**改依赖后最好手动重启服务。**
5. **改依赖后多关注 ES 报错**(关45):ES 客户端 9.x 装的 `CompatibilityVersion` 配置项,tsc 报"不存在" → 说明这个版本 API 变了 → 去查真实可用配置,而不是硬试。

### 🎯 追问盲区(明天复习重点)

- [ ] **OnApplicationBootstrap vs OnModuleInit**(连续2天答错→今天纠正):RabbitMQ连接在AppModule.onModuleInit执行,子模块onModuleInit先跑→channel undefined
- [ ] **ik_max_word vs ik_smart 方向**(昨天答反→今天对):max细切索引召回高,smart少切搜索精准

### 📈 能力跃迁

| 维度 | Day 16 | Day 17 |
|---|---|---|
| ES 集成 | 只会用curl操作ES | ✅ 完整集成到NestJS:Service+Controller+Module+MQ同步 |
| MQ 应用 | 只会发帖通知 | ✅ 一条消息多消费者(通知+搜索同步),理解Fanout解耦 |
| 端到端思维 | 单个接口测 | ✅ 发文章→MQ→ES→搜索 全链路打通 |
| 抽考表现 | 多题答含糊 | ✅ **7题全对(首次!)**,连续答错的Q2/Q6纠正了 |

### 🎯 明天计划

- 开工复习:OnApplicationBootstrap机制 + ik分词方向 + 漏await+ack可靠性
- **关 46:ES 进阶(高亮 + 相关度调优 + DSL)**
  - 搜索结果高亮(命中关键词标红)
  - DSL 查询语法(match/term/bool)
  - 相关度调优(boost 加权)

### 💬 一句话总结

> 今天最大的认知变化:**"自己动手做出来的,才是真本事"**。关 45 的 ES 集成,从环境搭建到搜索接口到 MQ 异步同步,全是自己一步步写+测出来的,不是看教程。中间踩了版本坑、漏await坑(第13次),但都自己排查解决了。最关键的是——下班抽考 7 题全对(训练以来首次),说明"动手做+闭卷抽考"的训练闭环真的有效,知识从"看过"变成了"想得起来"。这就是武汉 14-22K 全栈岗位要的能力:不只是会用 API,而是能从零搭起来+排查问题+讲清原理。

---

## Day 19 · 2026-08-07 · 关46 ES 进阶 + 阶段9 收尾

### 📚 今日产出

**关 46:ES 进阶 —— bool 组合查询(高亮 + 相关度调优跳过)**
1. **highlight 高亮**(实测感受):搜"全栈"返回 `<em>全</em><em>栈</em>`,两个 `<em>` 印证 ik_smart 把"全栈"切成两个 token。highlight 是 query 平级的顶层字段,返回额外的 highlight 字段(和 _source 并列),命中词被 `<em>` 包好。
2. **bool 四子句**(核心):
   - `must`:必须满足 + 算分(SQL AND)
   - `should`:满足则加分,不满足不排除(SQL OR,"有更好不强求")
   - `filter`:必须满足 + 不算分 + 缓存(WHERE)
   - `must_not`:必须不满足 + 不算分(NOT)
3. **must vs filter 灵魂区别**:筛选能力相同,差别只有算分 + 缓存。filter 性能优势两层:跳过算分计算 + 结果缓存成位图。**铁律:不需要比相关度的精确条件用 filter。**
4. **term vs match**:term 不分词精确比对(数值/枚举),match 分词后匹配(文本)。term 查 text → 0 命中(索引侧已分词,没完整 token)。
5. **should 语义**:用于"优先项",命中加分不命中不排除。**同一字段不能两头占**(在 must 又在 should → should 失效)。

### 🔥 踩坑 / 盲区(已进 S 级高频池)

1. **JSON DSL 格式铁律**(🔥 第3次踩,升 S 级):
   - 单引号不是合法 JSON:`{status: 'draft'}` ❌ → `{"status": "draft"}` ✅
   - 数值字段带引号:`{authorId: "7"}` ❌ → `{authorId: 7}` ✅(integer 不带引号)
   - 字段名错:`id` ❌ → `authorId` ✅(id 是 ES 文档主键,不是业务字段)
2. **filter 和 must_not 用反**(第1题):"排除作者5"写成 filter(保留),应该是 must_not。
3. **should 整个漏写**(第2题):"优先正文含Vue"没写 should,只在 must 里塞 multi_match。
4. **读题不仔细**(第3题):需求"只保留作者2",抄上一题的 5;需求"标题",写成 title+content。
5. **同一字段两头占**(第3题):must 里 multi_match 搜 title+content,should 又搜 title → should 失效。

### 🎯 追问盲区(明天复习重点)

- [ ] **JSON DSL 格式**(S级):双引号/数值不带引号/字段名 authorId
- [ ] **should 语义**:明天验证"有更好不强求"+ 不能同字段两头占
- [ ] **ik_max_word vs ik_smart**(08-03 重置,仍未补考过关)

### 📈 能力跃迁

| 维度 | Day 17 | Day 19 |
|---|---|---|
| ES 查询 | 只会单一 multi_match | ✅ 掌握 bool 四子句组合查询,能按需求拆 must/should/filter/must_not |
| 性能意识 | 不知道 filter 为何快 | ✅ 理解算分开销 + 位图缓存两层优势,知道精确条件用 filter |
| DSL 严谨度 | — | ⚠️ JSON 格式(引号/类型/字段名)是反复踩的盲区,需形成条件反射 |

### 🎯 明天计划

- 开工复习:JSON DSL 格式(S级)+ should 语义 + ik 分词(08-03 重置项)
- **阶段 10 开篇**(待定):可能是 Redis 进阶 / Docker 部署 / Vue 前端联调

### 💬 一句话总结

> 今天最大的认知变化:**"bool 四子句不是四个查询,是四个'态度'——必须(must)/优先(should)/硬筛(filter)/排除(must_not)"**。真正难的不是记语法,是面对一个搜索需求能正确判断"这个条件该放哪个子句"。三个反例(value 抄错、filter/must_not 用反、should 同字段失效)都是"想当然"的错——说明概念懂了,但"需求→子句"的映射还没形成肌肉记忆。这是 ES 面试最高频考点,明天起每天抽,直到条件反射。

---

## 🎉 阶段9 搜索引擎 Elasticsearch 收尾 (2026-07-28 ~ 08-07)

**6 关全过(关44-46),历时 11 天。** 从"为什么不用 LIKE"到"NestJS 集成搜索接口 + MQ 异步同步"再到"bool 组合查询",完整覆盖 ES 核心知识面。

### 阶段9 学到的硬技能(可写简历)
- ES 概念:倒排索引(词找文档)、为什么不用 LIKE、index/document/field 对照 MySQL
- 分词器:ik_max_word(索引细切召回) vs ik_smart(搜索少切精准)、standard 对中文单字灾难
- 集成:ElasticsearchService 全局封装、ArticleSearchService 自写、ensureIndex/indexArticle/search
- 异步同步:RabbitMQ Fanout 一条消息多消费者,create 发消息 + 搜索消费者写 ES
- 进阶:bool 四子句、must vs filter 性能、term vs match、highlight 高亮

---

## Day 19 下半场 · 2026-08-07 · 关47 并发基础(阶段A 开篇)

### 📚 今日产出

**关 47:并发基础 —— 进程/线程/事件循环再深入**(🔥 漏 await 13 次的根因课)
1. **进程 vs 线程**:进程=工厂车间(独立内存),线程=车间工人(共享资源)。传统后端多线程,Node 单线程。
2. **Node 单线程怎么并发**(核心):靠"异步 + 事件循环"两机制:
   - 机制A:主线程遇耗时操作不傻等,交出去给 **libuv 线程池**(默认4线程)干活
   - 机制B:**事件循环**不停转,主线程一有空就从队列取已完成事件"收尾"
3. **await 的角色**:① 等结果(等事件循环收尾) ② 让出主线程(等待期间处理别的请求,这才是并发来源)
4. **漏 await 的根因**(接回鉴权坑):发起查询后跳过"等收尾",拿了个 pending Promise 空壳 → Promise 是对象永远 truthy → 鉴权形同虚设

### 🧪 实测

- `concurrency-demo.ts`:对比串行 await(3秒)vs 并发 Promise.all(1秒)。亲眼看到"三个查询同时发起",主线程不傻等。

### 🔥 认知突破

| 之前(踩13次) | 关47之后 |
|---|---|
| "忘了加 await" | 理解了:漏 await = 截断"发起→等待→收尾"链路,只发起就跑路 |
| "Promise 是 truthy" | 理解了:Promise 空壳 = 事件循环还没收尾,拿到的不是数据 |

### 🎯 明天计划

- 验证关47:用术语复述漏 await 根因(不是背词)
- 补考逾期:ik 分词 / ack 语义 / JSON DSL 格式
- 关 48:事务隔离级别 + 锁

### 💬 一句话总结

> 今天最大的认知变化:**"主线程只派活,libuv 干活,事件循环收尾,await=等收尾"**。漏 await 踩 13 次不是"记性差",是"心智模型错了"——一直以为主线程亲自去查数据,所以觉得"查完自然有值"。现在模型对了:主线程发起就跑路,不 await 就永远拿不到收尾结果。这才是"并发"的真正含义。

---

## Day 19 第三场 · 2026-08-07 · 关48 事务隔离级别 + 锁

### 📚 今日产出

**关 48:数据库事务隔离级别 + 锁**(数据库面试头号考点)
1. **三个并发问题**:脏读(读未提交)/不可重复读(同行读两次值变)/幻读(行数变)
2. **四个隔离级别**(宽松→严格):读未提交→读已提交→可重复读→串行化,每升一级多防一个问题
   - MySQL 默认「可重复读」,Oracle/PG 默认「读已提交」
   - MySQL 的可重复读靠 Next-Key Lock 连幻读也防了(超纲实现)
3. **因果方向**:级别越高防得越多(不是导致越多!)
4. **锁分类**:悲观锁(FOR UPDATE,冲突频繁)/乐观锁(version字段,读多写少,关49实战)/共享锁/排他锁
5. **转账场景三要点**:事务(原子性)+可重复读(防脏读)+FOR UPDATE(防余额变负)

### 🔥 踩坑

1. **脏读定义答"废弃"**:废弃=已扔掉,但脏读读到的是**未提交**(还没确认,可能commit也可能rollback)。关键词是「未提交」。
2. **隔离级别因果说反**:"可重复读导致脏读"——完全反了!应是"读未提交导致脏读,可重复读防住脏读"。面试当场凉的程度。补考纠正。

### 📈 能力跃迁

| 维度 | 之前 | 关48之后 |
|---|---|---|
| 隔离级别 | 没系统学过 | ✅ 掌握四个级别+三个问题的对应关系,知道MySQL默认可重复读 |
| 锁 | 只听过名词 | ✅ 理解悲观vs乐观的核心差异(先锁死 vs 失败再说),知道FOR UPDATE是悲观锁 |

### 🎯 明天计划

- 验证关48:隔离级别因果方向(必考,今天说反过)
- 验证关47:漏await用术语复述
- 补考逾期:ik分词/ack语义/JSON DSL格式
- 关49:乐观锁实战(version字段+CAS,文章防并发覆盖)

### 💬 一句话总结

> 今天最大的认知变化:**"隔离级别不是越严格导致问题越多,而是越严格防得越多"**——说反了就是面试事故。隔离级别的本质是"性能vs安全"的权衡:级别越高越安全但越慢,MySQL选可重复读是折中,工程上没有"全用最高级"这种事。

---

## Day 20 · 2026-08-10 · 关49 乐观锁实战(阶段A 第3关)

### 📚 今日产出

- **开工复习(闭卷4题)**:验证08-07三大突破能否复现
  - 漏await时序链 ✅ → **连击2**(派活→libuv查→没等收尾→pending Promise truthy)
  - JSON DSL格式 ⚠️ → **第5次踩!** 单引号+数值类型已改对,但**字段名 id→authorId 又漏**
  - 隔离级别因果方向 ✅ → L1→L2(纠正同事"读未提交才导致脏读")
  - ik分词方向 ✅ → L1→L2(索引多切召回/搜索少切精准/反过来召回率降)
- **关49:乐观锁实战(文章防并发覆盖)**——完整走完"讲原理→骨架→用户写→实测"
  - Lost Update(丢失更新)问题:赤裸 update 后写覆盖先写
  - CAS思想:WHERE 带版本条件,count=0 判冲突
  - 亲手写:schema加version字段 + UpdateArticleDto + updateMany+increment+ConflictException
  - **HTTP 端到端实测全通过**:A成功(version 0→1)/B被409拒/C刷新后成功(version 1→2)

### 🕳️ 踩坑(关49 共4个)

1. **`data: {...dot}` 污染**(踩坑1):DTO 里 version 被展开进去,覆盖 increment → version 永远是0,乐观锁坏了。改:显式列 title/content + increment
2. **异常类选错**(踩坑2):`NotFoundException`(404)→ 应是 `ConflictException`(409)。版本冲突不是"不存在",是"状态冲突"
3. **return `{...article, ...dot}` hack**(踩坑3):拿更新前的旧对象+DTO合并,version还是旧的。改:updateMany后 findUnique 拿真实数据
4. **update 调 findOne 架构问题**(踩坑4,最深):findOne 带 zIncrBy(排行榜)+kafka.send(浏览日志)副作用 → 编辑一次=记一次浏览=假排行+脏数据+连累 update 500。改:findUnique 只查数据

### 🎯 追问表现

- Q1 update vs updateMany ✅(update抛异常没法区分,updateMany返回count)
- Q2 increment 好在哪 ⚠️("数据库操作逻辑干净"太虚)→ 补讲:应用层读出来算有并发窗口,数据库侧原子
- Q3 update调findOne合不合理 ✅(会重复计算浏览量)→ 抓到架构层面设计错误

### 📈 能力跃迁

| 维度 | Day 19 | Day 20 |
|---|---|---|
| 并发问题认知 | 只懂隔离级别理论 | ✅ 亲手实现乐观锁,实测 CAS 生效 |
| 异常类选用 | 含糊 | ✅ 404/409/403 分得清,版本冲突=409 |
| 架构思维 | 单个方法看 | ✅ 能看出"update调findOne带副作用"的设计错误 |
| 抽考表现 | 三大盲区突破 | ✅ **三大突破全部复现**(漏await连击2/因果L2/ik分词L2) |

### 🎯 明天计划

- 🔴 JSON DSL 字段名(id→authorId)第5次踩,明天重点验证"写DSL前扫schema"
- 关50:缓存与 DB 一致性(Cache-Aside 先删缓存还是先更新DB;延迟双删)

### 💬 一句话总结

> 今天最大的认知变化:**"副作用隔离"**——一个方法干一件事,update 就是更新数据,别让它顺手刷排行/发Kafka日志。这不只是代码风格,是架构问题:findOne 的依赖挂了,连累 update 一起 500,而 update 本身根本没错。写代码不是把功能堆进去,是让每个模块各司其职、互不连累。

---

## Day 21 · 2026-08-11 · 关50 缓存与 DB 一致性(阶段A 第4关)

### 📚 今日产出

**开工复习(6题闭卷抽考)**:
- ✅ bool should 同字段失效("加分项/或者/完全多余")→ L0→L1
- ✅ 事务漏 await 精确版("大概率没/线程池还在创建数据事务就提交")→ S 连击1
- ✅ JSON DSL 字段名(根因没看schema+对策先看字段)→ S 连击1
- ⚠️ MQ ack(语义精确"已执行完成",但 nack 重投仍漏)→ 改每天抽
- ⚠️ increment vs +1(方向对 B只+1/A读改写,并发窗口没说具体)→ L0留
- ❌ FOR UPDATE SQL(**第3次写残!** 把 FOR UPDATE 当 UPDATE 改数据)→ L0留

**关 50:缓存与 DB 一致性** —— ✅ 过关
- 讲透方案A(先删后更❌:旧值被读请求回填)vs 方案B(先更后删✅:你的代码)
- 延迟双删:第二次删才是灵魂(清窗口期被读请求回填的脏数据)
- delByPattern 事务外三原因(职责分离/Redis失败拖垮事务/拉长持锁)
- **自己发现 + 自己修 bug**:update/remove 漏删列表缓存(只删详情,列表吐旧标题60-90秒)
- 实测验证:更新前列表缓存有值 → 更新后被 delByPattern 清空 → 重读含新标题 ✅

### 🕳️ 盲区

| 点 | 问题 |
|---|---|
| FOR UPDATE SQL | 🔥🔥 第3次写残!写成"UPDATE balance=xx",把锁语句当改数据。根因:FOR UPDATE 是"读+锁"不是"写" |
| 延迟双删第二次删 | 说成"正常删旧缓存"(那是方案B),没说是"清窗口期回填的脏数据" |
| increment 并发窗口 | 方向对但没说具体(A读改写中间被覆盖 vs B单条UPDATE自带行锁串行) |
| MQ nack | ack语义对了,但失败时的 nack 重投连续漏 |

### 📈 能力跃迁

| 维度 | 之前 | 现在 |
|---|---|---|
| 缓存一致性 | "删缓存就行" | 能讲清方案A/B时序差异+延迟双删+事务边界 |
| bug 发现 | 别人指 | **自己读代码发现 update/remove 漏删列表缓存** |
| 工程取舍 | 全用最强 | 知道博客用方案B够,强一致才上延迟双删 |

### 🎯 明天计划

- 🔴 FOR UPDATE SQL 默写(第3次残,必须一次对) / MQ nack 重投(连续漏) / increment 并发窗口
- 关51:幂等性设计(幂等key/防重复提交/MQ消费者去重)

### 💬 一句话总结

> 今天最大的认知变化:**"删缓存不是一句 del 就完事"**——先删还是后删、删几个、放事务里还是外、要不要延迟双删,每个选择都对应一个并发漏洞。方案 A 翻车的根因不是读到旧值,而是旧值被回填进缓存;update 只删详情没删列表也是一种"回填旧值",道理相通。

---

## Day 21 下半场 · 2026-08-11 · 关51 幂等性设计(阶段A 第5关)

### 📚 今日产出

**关 51:幂等性设计** —— ✅ 过关(顺序 + 并发双实测)
- 幂等本质:执行 1 次和执行 N 次,系统最终状态一样(GET/PUT/DELETE 天然幂等,POST 不幂等)
- 前端防手滑 ≠ 后端幂等:前端按钮置灰拦不住 curl/网络重试/MQ 重投,后端才是底线(回扣关6"不信任客户端")
- idempotency-key:同一意图同 key,重试复用,新意图换新 key(银行转账流水号类比)
- 幂等只防"重复"(网络重试),不防"恶意刷"(那是限流 ThrottleGuard 的事)——职责分层
- 企业 4 种幂等方案:DB 唯一约束 / 一次性 token / 幂等 key / 状态机;微信支付 out_trade_no 就是幂等 key
- **并发幂等**:抢锁(setNx)让同 key 串行化 + 双检 + 自旋查缓存 + finally 释放锁
- MQ 消费者去重:SET NX processed:msgId 一步完成判重+占位(联动关45 ack)

**自修 bug 3 个**(教练指方向,用户自己改):
1. `idem:undefined` 污染:不带 key 的请求全被误判重复 → 查/存两头 if(idemKey)
2. 自旋查到缓存没 return → 白等 30 次抛 429 → 补 return
3. 双检放 if(lock) 外 → 没抢到锁的人 delOk 删别人的锁 → 挪进锁内

### 🕳️ 盲区

| 点 | 问题 |
|---|---|
| SET NX 语义 | 答"存缓存然后查缓存",没说"一条命令原子完成判重+占位,不存在竞态" |
| 双检原理 | 中途没懂"抢锁成功≠该干活",别人可能替你干完了(查缓存和抢锁是两个独立时刻) |

### 📈 能力跃迁

| 维度 | 之前 | 现在 |
|---|---|---|
| 幂等认知 | "前端防抖就够" | 懂幂等本质 + 4 种企业方案 + 职责分层(幂等vs限流) |
| 并发编程 | 写过抢锁 | 能完整设计"锁+双检+自旋"并发幂等流程并实测 |
| 边界处理 | 想正面 | 空 key / 自旋超时 / 锁过期 都能主动补 |

### 🎯 明天计划

- 🔴 FOR UPDATE SQL 默写(第3次残) / MQ nack 重投(连续漏) / increment 并发窗口 / SET NX 语义(今天新坑)
- 关52:分布式锁进阶(Redlock/锁续期看门狗——今天锁过期问题正好接上)

### 💬 一句话总结

> 今天最大的认知变化:**"幂等是协作机制,不是单方防线"**——前端生成 key、后端判重、限流挡恶意,三层各司其职;而且"抢到锁不等于该干活",查缓存和抢锁是两个时刻,中间别人可能替你干完了。并发不是加把锁就完事,锁内的每一次查都可能是双检。

### 🌙 下班抽考(4题全对 🎉)

| 知识点 | 判定 | 备注 |
|---|---|---|
| FOR UPDATE SQL | ✅ | 补讲后一次默对(第3次写残后吸收!) |
| 关50 方案A翻车根因 | ✅ | 旧值回填 + 并发击穿DB |
| 关51 双检原理 | ✅ | 抢到锁时活可能干完了 |
| SET NX 原子语义 | ✅ | 判重+占位+防并发(下午还答错) |

> 🎯 **今天总收成**:两关全过(50/51)+ 双实测 + 自修 4 个 bug + 下班抽考 4 题全对。阶段A 进度 5/6,只剩关52。
> ⚠️ 明天正式考:FOR UPDATE(对则升级)/ SET NX / MQ nack / increment窗口 / 延迟双删第二次删 / JSON字段名(连击1)

---

## Day 22 · 2026-08-13 · 关52 分布式锁进阶(阶段A 收尾,6/6 全绿)

### 📚 今日产出

**开工复习 · 7/7 全对 🎉(训练以来最干净的开工复习)**
- FOR UPDATE SQL 第4次正式考一次默对(L0→L1,三次残后站稳;⚠️拼写 form→from)
- MQ nack 重投 连续漏后补上(S连击0→1)
- JSON DSL 字段名 主动"先看schema"(S连击1→2)
- 漏await 连击3 **回3天轮**(13次盲区根治)
- increment 并发窗口讲具体(L0→L1)
- 延迟双删第二次删 精准"清窗口期回填脏数据"(L0→L1)
- SET NX 原子语义 三词全齐(L0→L1)

**关 52:分布式锁进阶** —— ✅ 过关(代码 + 双实测)
- **漏洞一·锁活不过业务**:过期时间两难(短了并发失效/长了崩溃占用,根源=业务耗时不可控)→ 看门狗(setInterval expire 续命,间隔=过期/3,业务完 clearInterval+unlock,崩溃则锁自然过期)。**实测**:业务 sleep 15s,redis-cli ttl 在 7~10 徘徊永不归零 → 锁活过了业务
- **漏洞二·锁没主人**:value 存 token(UUID),续期/删除前 Lua 原子校验"get==token 才操作"。为什么 Lua:两步走中间锁可能易主,Redis 单线程执行 Lua 焊死竞态(回扣 SET NX 同族)。**实测**:redis-cli 演 unlock(tokenB) 返回 0 不删 / unlock(tokenA) 返回 1 删掉
- **漏洞三·主从切换丢锁**:主从异步复制→主挂从顶上,从没同步到锁→锁凭空消失。看门狗/token 都救不了(治时间/归属,治不了消失)。Redlock 多节点多数派(5 抢 3)。争议:Kleppmann 批 GC/时钟漂移→用 ZK/etcd。选型:普通业务单 Redis / 钱用 ZK / 秒杀不用锁用 Redis 原子扣减
- eval 类型坑:ioredis eval 返回 unknown(动态回复),`as number` 断言

### 🕳️ 盲区

| 点 | 问题 |
|---|---|
| 秒杀选型 | 选了 Redlock,没意识到秒杀主流**不用分布式锁**(锁串行化 QPS 低),而是 Redis 原子扣减 Lua DECR + DB 兜底(阶段D关64) |
| 看门狗救不了主从切换 | 方向对(锁只在主)但表述绕,没点透"续的是还在的锁,锁没了没东西可续——治时间问题治不了存在性问题" |

### 📈 能力跃迁

| 维度 | 之前 | 现在 |
|---|---|---|
| 分布式锁认知 | 只会 SET NX | 三层演进(SET NX→看门狗+token→Redlock/共识)+ 讲清 failover 缺陷与取舍 |
| 原子性理解 | SET NX 一条命令原子 | 泛化为"先判断再操作的多步逻辑都要焊原子"(单条命令/Lua/SELECT FOR UPDATE 同族) |
| 选型判断 | 一把锁走天下 | 按场景分(普通单 Redis / 钱 ZK / 秒杀原子扣减) |

### 🎯 明天计划

- 🔴 MQ nack(连击1 再对1次)/ JSON DSL(连击2 再对1次)08-14 到期
- Node 单线程并发(逾期)/ 三个并发问题(逾期)补扫
- 阶段 B 开题:关 53 结构化日志 + 请求链路追踪

### 💬 一句话总结

> 今天最大的认知变化:**"锁只是优化,不是正确性保障"**——看门狗治时间、token 治归属、Redlock 治 failover,但每个都有破不了的边界(主从切换/GC 停顿),关键业务永远要 DB 约束兜底。而"先判断再操作的多步逻辑都要焊成原子"这条线索,从 SET NX → Lua → SELECT FOR UPDATE 一以贯之,是并发编程的同一根脊椎。

### 🌙 下班抽考(2过1偏1含糊)

| 知识点 | 判定 | 备注 |
|---|---|---|
| 关52 看门狗灵魂 | ✅ | 不用赌过期时间/自动续期/完成释放 |
| 关52 Lua为什么必须原子 | ❌ | 答成 SET NX 三词,没迁移到 unlock 场景。补讲:get比对→del之间锁易主,get成功那一刻还是我的,del前别人抢走→删别人的锁 |
| 关53 支付要不要ZK | ✅ | 不上ZK,DB事务+状态机+幂等 |
| 关14/42 漏await后果 | ⚠️ | 核心对(truthy),但后果又答"返回空对象"→精确:JSON.parse("[object Promise]")抛SyntaxError→500 |

> ⚠️ 明天必考:Lua 原子为什么(迁移场景)+ 漏await精确后果。关52刚学的概念,Lua迁移是首抽没接住——明天上班先补这两枪。

---

## Day 23(2026-08-14):开工复习 6 题 + 关 53 结构化日志通关

### 开工复习(2过4半对,不干净)

| 题 | 判定 | 备注 |
|---|---|---|
| Q1 Lua 为什么必须原子 | ❌ 第三次答偏 | 讲出"A过期→B抢→A删B锁"场景✅,但缺"GET成功那一刻还是我的→缝隙易主"。补讲 T0-T4 时间线。留 L0,08-15 必考 |
| Q2 MQ nack | ✅ 连击2 | 异常 nack/错用 ack→标记完成不重投 |
| Q3 JSON DSL | ⚠️ | 字段名 title✅,但 must 键又漏双引号 |
| Q4 漏await后果 | ⚠️ 进步 | 从"返回空对象"扳正为"解析报错",但仍缺 SyntaxError 精确类型 |
| Q5 Node 并发 | ⚠️ | "线程池去派活"因果反了(派活的是主线程),补讲老板/打工人/传话筒 |
| Q6 三并发问题 | ✅ L1→L2 | 三个全对,脏读"未提交+回滚"讲清 |

### 关 53:结构化日志 + 请求链路追踪(通关 🎓)

**四件套自建**:①RequestIdMiddleware(透传优先+生成+响应头回传) ②RequestContextService(AsyncLocalStorage 行李箱,run 包 next) ③LoggerService(pino+mixin 自动注入 requestId) ④TransformInterceptor 升级(结构化访问日志,迁 APP_INTERCEPTOR)。用户手写:中间件三步逻辑/context service/module×3/拦截器改造/异常过滤器迁移。

**实测链**:响应头验证(不同ID/透传沿用)→ ALS 并发隔离(demo-req-A/B 各拿各的)→ jq 数值筛选(duration>5ms)→ **张三闭环**(404 请求按 requestId 搜到 warn 日志:status/message/method/url 全带)。

**通关追问**:Q3 透传为什么(✅ A调B一张车票坐到底)/ Q1 定位流程(⚠️ 实测暴露失败请求链路为空→补异常日志)/ Q2 ALS vs 全局变量(⚠️ 只给结论没给机制,补讲"跟不跟人走",08-15 复验)。

### 踩坑实录

| 坑 | 教训 |
|---|---|
| 3 个残留 start:dev 幽灵进程抢 dist/端口 | 改代码不生效先查 `ps aux \| grep start:dev`;同一份 dist 只能有一个主人 |
| findOne 真 bug:comments 同时 select+include | 详情接口早就 500 了没人发现——改完必须回归测;Prisma 同层二选一铁律 |
| duration 写成 "103ms" 字符串 | 数值不带引号铁律从 ES 迁移到日志;字符串没法 jq 筛选/算 P99 |
| main.ts new 拦截器报 TS2554 | 全局组件带依赖 → APP_INTERCEPTOR/APP_FILTER 令牌注册,容器替你 new |
| 迁移类改动做一半(APP_FILTER 只删旧没接新) | 口诀:先接新再拔旧,一口气做完立刻编译验证 |
| macOS grep 把混 ANSI 的日志当二进制静默 | `grep -a`;根治=全 JSON 输出 |

### 📈 能力跃迁

| 维度 | 之前 | 现在 |
|---|---|---|
| 排障方式 | tail 日志肉眼扫,分不清哪行是谁的 | requestId 串链,grep 一条命令定位单请求全程 |
| 请求上下文传递认知 | 只会参数层层传/想到全局变量(并发必炸) | ALS 行李箱跟执行流走,零侵入 |
| NestJS 全局组件 | main.ts 自己 new | APP_* 令牌注册走 DI 容器 |

### 🎯 明天计划

- 🔴 开工必考:Lua 原子(GET成功缝隙)/ JSON must 双引号 / Node 并发(主线程派活)
- 关 53 新增复习项:ALS vs 全局变量机制、select/include 同层
- 关 54:监控指标(Prometheus + Grafana,RED 指标)

### 💬 一句话总结

> 今天最大的认知变化:**日志不是打给人看的,是打给机器查的**——结构化字段+requestId 贯穿,把"凌晨两点的万人瀑布"变成"grep 一条命令的单请求链路";而 ALS 教会我的底层原理是:并发世界里上下文不能存公共位置,要跟着执行流走。

---

## Day 24(2026-08-17):开工复习 7 题 + 关 54 监控指标通关

### 开工复习(4过2半对1补问,三天间隔后强留存)

| 题 | 判定 | 备注 |
|---|---|---|
| Q1 Lua 原子 | ⚠️→✅ | 第四次:点出 GET 成功✅但"同时拿到锁"时序糊。补讲三环(GET成功→缝隙过期→del删错)。**第五次复验全过,L0→L1** |
| Q2 JSON DSL | ✅ 毕业 | must 双引号/字段名全对,笔误 nest→nuest(手滑类)。S连击3回3天轮 |
| Q3 漏await | ✅ 根治 | pending→truthy→JSON.parse语法错误(SyntaxError)→500。三次答错后终于说对,S连击4 |
| Q4 ALS | ⚠️→✅ | 前半对,"根据上下文"循环论证→补讲机制。**复验自创"闭包变量"类比(L0→L1)** |
| Q5 select/include | ✅ L1 | 二选一铁律+user塞进select |
| Q6 Node并发 | ✅ L1 | 因果扳正:主线程派活→不等→处理别的→线程池完毕接管 |
| Q7 FOR UPDATE | ✅ L2 | 默写干净(from对!)+语义全对(读+锁/不改/commit释放) |

> 🎉 三天间隔后 4 过,漏await/JSON DSL/Node并发三大里程碑。08-17 开考当日清零。

### 关 54:监控指标 Prometheus + Grafana(通关 🎓)

**自己写**:MetricsService(计数器 http_requests_total + 直方图 http_request_duration_seconds)/ TransformInterceptor 打点(成功)+ /metrics 豁免 / AllExceptionsFilter 打点(失败)/ prometheus.yml / Grafana 数据源+面板。

**实测链**:/metrics 裸文本 → targets up → Prometheus 采到按路由/状态码分的数据 → 刷 60 秒流量 → Grafana 曲线(QPS 0.4~1.3、404 计数 38)。

**通关追问**:Q1 code!="200" 为什么不行(✅ 3xx/403/429 不算错)/ Q2 为什么桶不算全量(⚠️ 补:桶把算 P99 成本从 O(全量) 降到 O(桶数))/ Q3 保护(⚠️ 内网只是第一层,要 basic_auth/token 鉴权)。

### 踩坑实录

| 坑 | 教训 |
|---|---|
| prom-client 标签没声明就传 → 所有接口 500 | inc/observe 的标签必须在 labelNames 声明过,运行时强校验 |
| 打点抛异常杀死业务请求 | try-catch 包打点,监控绝不能拖垮业务 |
| /metrics 被全局拦截器包成 JSON 壳 | 拦截器按 url 放行 /metrics |
| Prometheus 拒收 text/html | controller 加 @Header('Content-Type','text/plain') |
| request.url 当标签 → 基数爆炸 | 用 request.route?.path 路由模板 |
| rate 曲线 0/空白 | 不是没数据是没流量,rate 算变化率 |
| Docker daemon 挂 → 全容器 Exited | open -a Docker 重启,容器数据不丢 |
| 镜像拉不动 | DaoCloud 加速源 docker.m.daocloud.io |

### 📈 能力跃迁

| 维度 | 之前 | 现在 |
|---|---|---|
| 监控认知 | 日志=一切 | 日志(查单请求明细) vs 指标(看全局趋势)分家,RED 三要素 |
| 埋点 | 无 | 计数器+直方图桶,预先聚合,O(1) 查询 |
| 运维 | 不知道/没数据 | 能判断"没数据=没流量"、Docker 容器重启、内网+鉴权保护监控入口 |

### 🎯 明天计划

- 关 55:健康检查 + 优雅停机(/health 探针、SIGTERM 排空连接)
- 08-18 到期:关50缓存一致性 / 关51幂等 / bool四子句(逾期)

### 💬 一句话总结

> 今天最大的认知变化:**指标是"预先聚合"的账本,不是"查询时现算"的报告**——请求发生时用微秒级原子操作记账(计数器+1、耗时丢进桶),看板读的是现成的数。这和"日志查明细"是两种工具:日志回答"这一个请求怎么了",指标回答"整个系统健不健康"。

### 🌙 下班抽考(3过1半对)

| 知识点 | 判定 | 备注 |
|---|---|---|
| 关54 RED+Counter/Histogram分工 | ✅ | RED三字母全对;Counter算R/E,Histogram算D(P99)。L1→L2 |
| 关54 为什么预先聚合 | ✅ | 高QPS写MySQL拖垮业务库——监控反噬业务 |
| 关50 缓存一致性方案A | ✅ | 旧值被并发读请求回填,缓存永远旧。L1→L2 |
| 关51 幂等4种方案 | ⚠️ | 本质✅但只说出2种(幂等key),前端置灰当方案。补讲:唯一约束/token/幂等key/状态机;前端防手滑≠后端幂等。重置L0,08-18必考 |

> ⚠️ 明天必考:幂等 4 种方案全说出(重置 L0)+ 关54 监控踩坑铁律。
