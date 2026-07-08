import { getAllTasks, getTaskById, createTask, deleteTask } from "./tasks_db.ts"

console.log("=== 1. 查全部(初始空) ===")
console.log(await getAllTasks())

console.log("=== 2. 创建任务 ===")
const t1 = await createTask("学MySQL")
const t2 = await createTask("写简历")
console.log(t1, t2)

console.log("=== 3. 查单个 ===")
console.log(await getTaskById(t1.id))

console.log("=== 4. 查全部(2条) ===")
console.log(await getAllTasks())

console.log("=== 5. 删除 ===")
console.log(await deleteTask(t1.id))

console.log("=== 6. 查全部(剩1条) ===")
console.log(await getAllTasks())

process.exit(0)