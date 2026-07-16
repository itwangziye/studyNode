# Node.js 全栈学习

> 目标:前端转全栈,对标武汉 Node 全栈岗位(NestJS + TypeScript,14-22K)
> 训练方式:师徒制,每关实战 + 追问,做对才进下一关
> 每天开工跟我说"复习",我会按 `SPACED_REVIEW.md` 的「📅 今日到期」清单出题(基于艾宾浩斯遗忘曲线的间隔重复系统,不再只复习昨天)

## 📊 进度看板

### 阶段1:Node 内功 ✅ 已完成 (2026-07-03)|2026-07-04 复习巩固

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 1 | 模块系统 ESM | ✅ | 路径必带后缀、re-export 不进作用域 |
| 2 | 事件循环 | ✅ | nextTick > 微任务 > 宏任务 |
| 3 | Stream | ✅ | pipeline、Transform、内存恒定 |
| 4 | 文件系统 | ✅ | stdout/stderr、异步循环、endsWith |
| 5 | EventEmitter | ✅ | 参数属性不支持、once、error 必接 |
| 6 | HTTP 服务器 | ✅ | 徒手写 API、不信任客户端、异步 return |

> 📖 **Day 2 复习**:核心点全记住,但测出 3 个理解盲区(await 切割机制、输入校验多层、API 名 create/pipeline),已补讲。详见 LOG.md。

### 🔔 待巩固(明天先复习这些)

**Day 1-5 已掌握的(抽查即可)**
- [ ] `await` 把后半段扔进微任务队列(`async` 函数调用时同步部分立刻跑,撞上 await 才停)
- [ ] 校验写法 `if (!title)`(报错用 `!`,处理不用)
- [ ] **`?` 占位符防 SQL 注入** —— 永远不拼字符串,注入是"成功执行攻击 SQL"不是报错
- [ ] **`import type`** —— interface 跨文件导入必须用,运行时整行抹掉
- [ ] **`throw null` 是 bug** —— throw 只扔 Error 对象
- [ ] 防枚举攻击 —— login 统一返回不泄露细节

**Day 6 新坑(明天重点复习)**
- [ ] **漏 await 第 11 次!**(`bcrypt.compare` 未 await——密码错也能登录!)—— 看到异步方法**条件反射加 await**
- [ ] **NestJS import 不带 `.ts`**(跟裸 Node 规则相反)—— NestJS 用 tsc 编译,import .ts 会报错
- [ ] **`.env` 加载** —— NestJS 入口只有 main.ts,必须 `import "dotenv/config"`
- [ ] **Guard 替代中间件** —— Guard 返回 boolean(true放行/false自动401),不用手写 next()
- [ ] **NestJS 异常** —— `throw new NotFoundException()` 替代 `res.status(404).json(...)`
- [ ] **IoC 核心** —— 构造函数声明即注入,不 `new`;`@Injectable` 贴标签

### 阶段2:Web 后端 ✅ 已完成 (2026-07-06 ~ 07-07)

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 7 | Express + 中间件 | ✅ | app.use/get/post、中间件链、next() 接力 |
| 8 | 路由组织 | ✅ | routes→controller→data 三层、Router、req.params |
| 9 | MySQL + SQL | ✅ | CRUD SQL、? 防注入、createPool、DATABASE_URL |
| 10 | Prisma ORM | ✅ | schema/migrate/generate、findMany/create/deleteMany、Prisma 7 配置 |
| 10.5 | Prisma 关联关系 | ✅ | 1:N 建模、嵌套创建、include、_count、级联删除 |
| 11 | JWT 鉴权 | ✅ | bcrypt 加密、jwt sign/verify、鉴权中间件、防枚举攻击 |

### 阶段3:NestJS 全栈 ⏳ 进行中 (2026-07-08)

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 12 | NestJS 三件套 + IoC | ✅ | @Controller/@Module/@Injectable、依赖注入(IoC容器) |
| 12.5 | CRUD 装饰器全套 | ✅ | @Post/@Body/@Param、NotFoundException、BadRequestException |
| 13 | PrismaService 集成 | ✅ | PrismaService 全局单例注入、真 MySQL 持久化 |
| 14 | JWT 鉴权(Guard) | ✅ | JwtModule/PassportStrategy、@UseGuards(JwtAuthGuard)、ConflictException |
| 15 | 项目部署 | ✅ | ValidationPipe校验、CORS、Dockerfile多阶段构建、PM2进程管理、docker-compose |

### 阶段4:NestJS 进阶 + Redis ✅ 已完成 (2026-07-09 ~ 07-14)

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 16 | 全局异常过滤器 | ✅ | ExceptionFilter、@Catch()空括号兜底所有异常、安全脱敏不泄露堆栈 |
| 17 | 响应拦截器 | ✅ | Interceptor双向夹击、tap打日志/map包壳、与过滤器配对统一响应规范 |
| 18 | 自定义管道 | ✅ | PipeTransform校验+改造、内置ParseIntPipe替代手写Number()、ValidationPipe.transform对单参数的副作用 |
| 19 | RBAC 角色权限 | ✅ | User加role字段、@Roles装饰器(SetMetadata)、RolesGuard读元数据比对角色、JwtStrategy查库取role、401/403区分 |
| 20 | Swagger 文档 | ✅ | @nestjs/swagger、DocumentBuilder配置、SwaggerModule.setup、@ApiTags/@ApiOperation/@ApiBearerAuth装饰器 |
| 21 | 自定义参数装饰器 | ✅ | createParamDecorator、@CurrentUser()替代@Req()拿用户、解耦Controller与Express |
| 22 | Redis 集成 + 缓存策略 | ✅ | RedisService全局单例、Cache-Aside旁路缓存、findAll加缓存+TTL |
| 23 | 缓存三大问题防护 | ✅ | 穿透(缓存空对象)、击穿(SET NX分布式锁单飞)、雪崩(TTL随机抖动) |
| 24 | 限流拦截器(滑动窗口) | ✅ | ThrottleGuard、Sorted Set滑动窗口、ZREMRANGEBYSCORE清旧+ZCARD计数+ZADD记录、429拒绝 |
| 25 | Sorted Set 排行榜 | ✅ | zIncrBy加分+zRevRange取TopN、completeTask+getRanking、路由顺序坑、Redis字符串+JS加法陷阱 |

### 阶段5:消息队列 ✅ 已完成 (2026-07-14 ~ 07-16)

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 26 | 消息队列概念 + RabbitMQ 集成 | ✅ | MQ三大作用、RabbitMQ vs Kafka选型、Producer/Consumer、ack确认、OnApplicationBootstrap生命周期坑 |
| 27 | RabbitMQ Fanout Exchange 实战 | ✅ | Exchange四种类型、Fanout广播三消费者、assertExchange+bindQueue、消费者必须注册Module |
| 28 | Kafka 集成实战 | ✅ | Topic/Partition/ConsumerGroup/offset、fromBeginning消息回放、kafkajs API、单节点replication factor坑 |

---

## 📁 目录结构

```
studyNode/
├── README.md            ← 你现在看的这个(进度看板)
├── LOG.md               ← 每日学习记录
├── REVIEW.md            ← 复习手册(知识点速查)
├── SPACED_REVIEW.md     ← 间隔重复追踪表(每天复习看这里:今日到期/阶位滚动)
├── package.json
├── tsconfig.json
└── phase1_core/         ← 阶段1 全部代码
    ├── lesson01_modules/      app.ts, math/
    ├── lesson02_event_loop/   challenge.ts, challenge2.ts
    ├── lesson03_stream/       stream-transform.ts, big.log
    ├── lesson04_fs/           archive.ts
    ├── lesson05_event_emitter/ downloader.ts
    └── lesson06_http/         server.ts, test-server.sh
```

## 🚀 常用命令

```bash
cd ~/Desktop/lovenote/demo/studyNode

# 跑某一课的代码
pnpm lesson phase1_core/lesson01_modules/app.ts

# 测 HTTP 服务器
cd phase1_core/lesson06_http && bash test-server.sh
```

## 🛠️ 环境

- Node v22.22.0(原生支持 TS,只擦除类型不转换 → 不支持 enum/参数属性)
- pnpm 11.3.0
- fnm 0.39.7(Node 版本管理)
