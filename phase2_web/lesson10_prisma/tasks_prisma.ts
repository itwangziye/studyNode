import "dotenv/config"

import { PrismaClient } from "../../src/generated/prisma/client.ts"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

export interface Task {
  id: number
  title: string
  done: boolean
}

// TODO: 在这里实例化 adapter 和 prisma 客户端
// 提示:PrismaMariaDb 构造函数接收什么?PrismaClient 又怎么接收 adapter?
// 线索 →  node_modules/@prisma/adapter-mariadb/README.md

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({adapter})

// ① 查全部
export async function getAllTasks(): Promise<Task[]> {
    return prisma.task.findMany()
}

// ② 查单个(id 不存在返回 null)
export async function getTaskById(id: number): Promise<Task | null> {
    return prisma.task.findUnique({where: {id}})
}

// ③ 创建(返回带 id 的新任务)
export async function createTask(title: string): Promise<Task> {
    return prisma.task.create({data: {title}})
}

// ④ 删除(返回 boolean,删到=true)
export async function deleteTask(id: number): Promise<boolean> {
    const result = await prisma.task.deleteMany({where: {id}})
    return result.count > 0
}
