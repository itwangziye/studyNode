import "dotenv/config"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "../../src/generated/prisma/client.ts"

// 实验:直接传 string url 给 PrismaMariaDb
console.log("DATABASE_URL =", process.env.DATABASE_URL!)

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

try {
  const all = await prisma.task.findMany()
  console.log("✅ string 形式成功!共", all.length, "条")
  console.log(JSON.stringify(all, null, 2))
} catch (e) {
  console.log("❌ string 形式失败:")
  console.log((e as Error).message)
}

await prisma.$disconnect()
setTimeout(() => process.exit(0), 1000)
