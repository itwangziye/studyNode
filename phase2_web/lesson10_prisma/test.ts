import "dotenv/config"
import { getAllTasks, getTaskById, createTask, deleteTask } from "./tasks_prisma.ts"

let step = 0
const ok = (msg: string) => console.log(`✅ ${++step}. ${msg}`)
const fail = (msg: string) => { console.log(`❌ ${++step}. ${msg}`); process.exit(1) }

// ① 查全部(初始状态)
const before = await getAllTasks()
console.log(`\n初始数据:${before.length} 条`)
ok(`查全部 → ${before.length} 条`)

// ② 创建
const t1 = await createTask("学 Prisma")
console.log("创建结果:", t1)
if (t1.id && t1.title === "学 Prisma") ok(`创建 → 拿到 id=${t1.id}, title 对了`)
else fail("创建结果不对")

// ③ 查单个
const found = await getTaskById(t1.id)
if (found?.title === "学 Prisma") ok(`查单个 → 完整对象,id=${found.id}`)
else fail("查单个失败")

// ④ 查全部(应该多了一条)
const after = await getAllTasks()
if (after.length === before.length + 1) ok(`查全部 → 多了 1 条(共 ${after.length})`)
else fail(`数量不对,期望 ${before.length + 1},实际 ${after.length}`)

// ⑤ 删除
const deleted = await deleteTask(t1.id)
if (deleted) ok(`删除 → true`)
else fail("删除返回 false")

// ⑥ 删后查全部(应该回到初始数量)
const final = await getAllTasks()
if (final.length === before.length) ok(`删后 → 剩 ${final.length} 条(回到初始)`)
else fail(`删后数量不对,期望 ${before.length},实际 ${final.length}`)

// ⑦ 测试 deleteTask 删不存在的 id(返回 false,不抛错)
const ghost = await deleteTask(999999)
if (ghost === false) ok(`删不存在的 id → false(没抛错,deleteMany 正确)`)
else fail(`应该返回 false,实际 ${ghost}`)

console.log("\n🎉 全部通过!")
process.exit(0)
