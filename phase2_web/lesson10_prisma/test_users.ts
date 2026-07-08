import "dotenv/config"
import { createUser, getUserWithTasks, getAllUsersWithTaskCount, deleteUser } from "./users_prisma.ts"
import { PrismaClient } from "../../src/generated/prisma/client.ts"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

// 复用 prisma 实例做级联验证(查删完的 task 还在不在)
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

let step = 0
const ok = (msg: string) => console.log(`✅ ${++step}. ${msg}`)
const fail = (msg: string) => { console.log(`❌ ${++step}. ${msg}`); process.exit(1) }

// ① 嵌套创建:用户 + 2 个任务
console.log("\n=== ① 嵌套创建 ===")
const u1 = await createUser("王Ye", "wz@test.com", ["学Prisma", "投简历"])
if (u1.id && u1.tasks?.length === 2) {
  console.log(`  用户 id=${u1.id}, tasks=${u1.tasks.length}`)
  ok("嵌套创建 → 用户 + 2 任务,外键自动设好")
} else fail(`嵌套创建失败: ${JSON.stringify(u1)}`)

// ② 查用户带任务(include)
console.log("\n=== ② include 查询 ===")
const found = await getUserWithTasks(u1.id)
if (found && found.tasks?.length === 2 && found.name === "王Ye") {
  console.log(`  ${found.name} 的任务:`, found.tasks.map(t => t.title))
  ok("include → 自动 JOIN 出嵌套结构")
} else fail("include 查询失败")

// ③ 查全部用户带任务数(_count)
console.log("\n=== ③ _count ===")
const u2 = await createUser("张三", "zs@test.com", ["吃饭"])
const all = await getAllUsersWithTaskCount()
console.log("  所有用户:", all)
if (all.length >= 2 && all.some(u => u.taskCount === 2) && all.some(u => u.taskCount === 1)) {
  ok("_count → 每个用户的任务数,不取详情")
} else fail(`_count 数据不对: ${JSON.stringify(all)}`)

// ④ 删用户不存在 → null
console.log("\n=== ④ 删不存在 ===")
const ghost = await deleteUser(999999)
if (ghost === null) ok("删不存在的 id → null(没抛异常)")
else fail(`应该返回 null,实际 ${ghost}`)

// ⑤ 删用户 → 返回对象 + 级联(userId 变 null)
console.log("\n=== ⑤ 级联删除 ===")
const u2Tasks = await prisma.task.findMany({ where: { userId: u2.id } })
const deleted = await deleteUser(u2.id)
if (deleted && deleted.id === u2.id) {
  console.log(`  删除返回:`, deleted)
  ok("删用户 → 返回被删对象")
} else fail("删用户没返回对象")

// ⑥ 验证级联:被删用户的任务 userId 应该变 null(ON DELETE SET NULL)
console.log("\n=== ⑥ 级联效果验证 ===")
const orphanTasks = await prisma.task.findMany({ where: { id: { in: u2Tasks.map(t => t.id) } } })
console.log("  这些任务应该 userId=null:", orphanTasks.map(t => ({id: t.id, userId: t.userId})))
if (orphanTasks.length > 0 && orphanTasks.every(t => t.userId === null)) {
  ok("级联 → 删用户后,他的任务 userId 自动变 null")
} else fail(`级联没生效: ${JSON.stringify(orphanTasks)}`)

// 清理:删掉测试用的 u1 和它的任务
await deleteUser(u1.id)
await prisma.task.deleteMany({ where: { userId: null } })  // 清掉孤儿任务

console.log("\n🎉 关联关系全部通过!")
await prisma.$disconnect()
setTimeout(() => process.exit(0), 1000)
