# Node.js 全栈学习

> 目标:前端转全栈,对标武汉 Node 全栈岗位(NestJS + TypeScript,14-22K)
> 训练方式:师徒制,每关实战 + 追问,做对才进下一关
> **当前状态:6 个阶段全部完成,36 关全绿,具备投递 14-22K 全栈岗位的能力**

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

### 阶段6:真实项目实战 —— 博客内容平台 ✅ 已完成 (2026-07-16 ~ 07-22)

> 把阶段 1-5 学的所有技术整合成一个简历级全栈产品:Vue 3 + NestJS + MySQL + Redis + RabbitMQ + Kafka

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 29 | 数据建模 Article + Comment | ✅ | Prisma 1:N 建模、双向关联铁律、author语义化命名、@db.Text、migrate |
| 30 | 文章 CRUD API | ✅ | 分页skip+take、select过滤password、权限判断顺序(404→403)、DTO校验、@IsEmpty反向坑 |
| 31 | 文章缓存 + 排行榜 | ✅ | Cache-Aside复用、缓存key含分页参数、delByPattern通配删除、排行榜zIncrBy、写操作删缓存策略 |
| 32 | 评论功能 | ✅ | Comment模块、嵌套路由、跨模块关联查询、发评论验证文章存在、权限(404→403) |
| 33 | RabbitMQ 通知 + Kafka 日志 | ✅ | 发文RabbitMQ Fanout广播通知、看文Kafka浏览日志、fromBeginning重放 |
| 34 | 限流防护 | ✅ | ThrottleGuard复用、发文章/发评论限流防刷屏、按IP vs userId选型 |
| 35 | Vue 3 前端 | ✅ | Vite+Vue Router+Axios封装、JWT拦截器、文章列表/详情/评论/写文章、路由守卫 |
| 36 | 端到端联调 + 收尾 | ✅ | 前后端+MySQL+Redis+RabbitMQ+Kafka 六组件全链路联调通过 |

### 阶段7:工程化进阶 —— 调试 ✅ 已完成 (2026-07-22)

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 37 | VSCode 断点调试 NestJS | ✅ | launch.json配置(nvm路径)、断点/Variables/CallStack/Debug Console、F10跳过/F11进入 |
| 38 | 断点调试实战(排查真实 Bug) | ✅ | 条件断点/Logpoint、Debug Console查Redis、排查update未删列表缓存Bug、Controller vs Service依赖关系 |
| 39-40 | 单元测试 | ⏭️ 跳过 | 用户选择跳过,后续有需要再补 |

### 阶段8:数据库进阶 —— 事务 + 查询优化 ✅ 已完成 (2026-07-23 ~ 07-28)

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 41 | 数据库事务概念 + Prisma $transaction | ✅ | ACID;简单数组 vs 交互式 async 事务;事务里只放 DB 操作 |
| 42 | 事务实战(批量创建文章) | ✅ | 交互式 $transaction 批量创建;实测验证漏 await→返回[{},{}]且 DB 0 条;any 吃掉类型保护(标 Article[] tsc 会拦) |
| 43 | N+1 查询问题 + 优化 | ✅ | N+1用include联表一次查完(嵌套include:文章带评论带评论人);select白名单脱敏password vs include关联加载;深分页OFFSET扫描丢弃→游标分页WHERE id>lastId;缓存救不了深分页首次查询 |

### 阶段9:搜索引擎 —— Elasticsearch ✅ 已完成 (2026-07-28 ~ 08-07)

| 关 | 主题 | 状态 | 关键收获 |
|---|---|---|---|
| 44 | ES 概念 + 为什么不用 LIKE 模糊查询 | ✅ | LIKE %开头索引失效(B+树无法定位)、无相关度排序、中文分词差;倒排索引=词找文档(不是文档找词!);ES index=MySQL表;文档=行;分词器把长词拆成单元匹配 |
| 45 | ES 集成 NestJS(文章搜索接口) | ✅ | ES Docker环境+ik分词器;ElasticsearchService全局封装;ArticleSearchService(ensureIndex/indexArticle/search自写);GET /articles/search搜索接口;RabbitMQ异步同步(create发消息+ArticleSearchConsumer写ES);9.x客户端版本不匹配坑(降级到8.x);端到端打通(发文章→搜到) |
| 46 | ES 进阶(bool 组合查询) | ✅ | highlight高亮(返回带<em>标签的片段,实测两个<em>印证ik单字切分);bool四子句:must(必须,算分)/should(有更好,加分)/filter(必须,不算分,缓存)/must_not(必须不,不算分);must vs filter性能差(filter跳过算分+缓存位图);term精确不分词(数值/枚举)vs match分词(文本);单字段match多字段multi_match;优先项与硬条件不能同字段两头占 |

---

### 🔭 进阶训练路线图(关 47-65,老师傅毕业)

> 目标:前端→高级全栈。侧重 ① 并发/数据一致性 ② 系统设计/架构 ③ 生产运维/可观测性。一边开新课一边滚复习。

#### 阶段A:并发与数据一致性(关 47-52) ⏳ 进行中 (2026-08-07)

| 关 | 主题 | 训练点 | 通关标准 | 状态 |
|---|---|---|---|---|
| 47 | 并发基础:进程/线程/事件循环再深入 | Node 单线程异步的"并发但不并行";漏 await=时序失控的根因 | 闭卷讲清"Node 怎么用1线程并发处理1000请求" | ✅ |
| 48 | 数据库事务隔离级别 + 锁 | 读未提交/读已提交/可重复读/串行化;脏读/不可重复读/幻读;行锁/间隙锁/乐观锁/悲观锁 | 能说清"转账场景该用哪个隔离级别+为什么" | ✅ |
| 49 | 乐观锁实战(文章防并发覆盖) | version 字段 + WHERE version=x;CAS 思想;与 $transaction 结合 | 写出"两人同时编辑同一文章,后提交者被拒"接口 | ⏳ |
| 50 | 缓存与 DB 一致性 | Cache-Aside 先删缓存还是先更新DB;延迟双删;delByPattern 为啥在事务外 | 闭卷讲清"更新文章后,什么时刻删缓存才不读脏数据" | ⏳ |
| 51 | 幂等性设计 | 幂等 key、防重复提交、MQ 消费者去重(联动关45 ack) | 写出"同一请求发3次只创建1条文章"幂等接口 | ⏳ |
| 52 | 分布式锁进阶(超越 SET NX) | Redlock 争议、锁续期(看门狗)、锁失效兜底;与关23单飞锁对比 | 闭卷讲清"SET NX 锁在 Redis 主从切换时为啥失效" | ⏳ |

#### 阶段B:生产运维与可观测性(关 53-57)

| 关 | 主题 | 训练点 | 通关标准 |
|---|---|---|---|
| 53 | 结构化日志 + 请求链路追踪 | pino/winston + requestId 贯穿;traceId 跨服务 | 每个请求打唯一 id,日志按 id 串起来 |
| 54 | 监控指标(Prometheus + Grafana) | RED 指标(Rate/Error/Duration);直方图 vs 计数器 | Grafana 看到文章接口 QPS/P99/错误率 |
| 55 | 健康检查 + 优雅停机 | /health 探针、K8s liveness/readiness;SIGTERM 排空连接 | kill 进程时,在途请求处理完才退出 |
| 56 | 性能瓶颈定位实战 | clinic.js/火焰图;慢 SQL EXPLAIN;回扣关43 N+1 | 给慢接口做性能剖析,指出瓶颈并优化 |
| 57 | 压测 + 容量规划 | autocannon/k6;QPS/并发/延迟关系;压出缓存击穿真实效果 | 得出数字:"单机扛多少 QPS,瓶颈在哪" |

#### 阶段C:系统设计与架构(关 58-62)

| 关 | 主题 | 训练点 | 通关标准 |
|---|---|---|---|
| 58 | 系统设计方法论 | 洋葱架构/CQRS 概念;DDD 入门;"拿到需求怎么拆" | 给需求(如"秒杀")画模块图+说清边界 |
| 59 | 从单体到微服务:拆还是不拆 | 微服务代价(分布式事务/网络故障/调试难);何时不该拆 | 闭卷讲清"微服务相比单体的3个代价" |
| 60 | API 设计进阶 | RESTful 进阶(HATEOAS)、GraphQL vs REST、版本化、错误契约 | 重构文章 API 符合 REST 成熟度 Level 2 |
| 61 | 认证授权进阶(超越 JWT) | OAuth2 四模式、OIDC、refresh token 轮换、JWT 注销坑 | 闭卷讲清"JWT 为啥不能主动注销,怎么补救" |
| 62 | 消息队列进阶:可靠投递与最终一致 | 本地消息表/outbox 模式、死信队列、消息重复消费根因 | 给 RabbitMQ 接死信队列,失败消息能被人工处理 |

#### 阶段D:老师傅毕业项目(关 63-65)

| 关 | 主题 | 检验能力 |
|---|---|---|
| 63 | 项目启动:**秒杀系统**(或投票/抢券) | 架构设计(阶段C)+ 并发控制(阶段A)综合 |
| 64 | 秒杀深入:扣减库存 + 防超卖 | Redis 原子扣减 + Lua + DB 兜底一致性 |
| 65 | 秒杀收尾:全链路压测 + 复盘 | 阶段B 可观测性 + 容量验证,简历级产出 |

---
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
