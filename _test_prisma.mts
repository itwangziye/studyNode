import "dotenv/config"
import { getAllTasks, getTaskById, createTask, deleteTask } from "./phase2_web/lesson10_prisma/tasks_prisma.ts"

const t = await createTask("测试-adapter导入修复-" + Date.now())
console.log("✅ create:", t)
console.log("✅ getById:", await getTaskById(t.id))
console.log("✅ getAll count:", (await getAllTasks()).length)
console.log("✅ delete:", await deleteTask(t.id))
console.log("✅ getById after delete:", await getTaskById(t.id))
