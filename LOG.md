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

