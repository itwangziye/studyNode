import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client.ts"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import type { Task } from './tasks_prisma.ts';
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

export interface User {
  id: number
  name: string
  email: string
}

// ① 创建用户(同时创建他的若干任务)—— 体验"嵌套创建"
//    示例:createUser("王Ye", "wz@test.com", ["学Prisma", "投简历"])
//    应该:创建 User + 创建 2 个 Task + 自动设好外键
export async function createUser(
  name: string,
  email: string,
  taskTitles: string[] = []    // 默认空数组
): Promise<User & { tasks: Task[] }> {
    return await prisma.user.create({
        data: {
            name, 
            email, 
            tasks: {
                create: taskTitles.map(title => ({title}))
            }
        },
        include: {tasks: true}
    })
}

// ② 查用户,**带上他的所有任务** —— 体验 include
export async function getUserWithTasks(userId: number): Promise<
  (User & { tasks: Task[] }) | null
> {
    return await prisma.user.findUnique({where: {id: userId}, include: {tasks: true}})
}

// ③ 查全部用户,每个用户**只显示任务数量**(不列出任务详情)—— 体验 _count
//    返回:[{ id, name, email, taskCount: 3 }, ...]
export async function getAllUsersWithTaskCount(): Promise<
  (User & { taskCount: number })[]
> {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: {tasks: true}
            }
        }
    })
    return users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        taskCount: u._count.tasks
    }))
}

// ④ 删除用户 —— 体验级联删除(删用户后,他的任务应该 userId 变 null)
//    返回被删的 User 对象,不存在返回 null
export async function deleteUser(userId: number): Promise<User | null> {
    try {
        const user = await prisma.user.delete({
            where: {id: userId}
        })
        return user
    } catch (error) {
        return null
    }
}