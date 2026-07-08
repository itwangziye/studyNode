import "dotenv/config"   // ← 加载 .env 到 process.env(必须最早执行)
import mysql from "mysql2/promise"

// mysql2 直接支持连接字符串(行业标准写法,后面 Prisma 也用这个)
const pool = mysql.createPool(process.env.DATABASE_URL!)

export interface Task {
    id: number,
    title: string,
    done: number
}


// ① 查全部:SELECT
export async function getAllTasks(): Promise<Task[]> {
    const [rows] = await pool.query("select * from tasks")
    return rows as Task[]
}

// ② 查单个:SELECT + WHERE
export async function getTaskById(id: number): Promise<Task | undefined> {
    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id])
    
    const result = rows as Task[];
    return result[0]
}

// ③ 创建:INSERT
export async function createTask(title: string): Promise<Task> {
    const [result] = await pool.query("INSERT INTO tasks (title) VALUES (?)", [title])
    const insertId = (result as mysql.ResultSetHeader).insertId 
    return (await getTaskById(insertId))!
}

// ④ 删除:DELETE
export async function deleteTask(id: number): Promise<boolean> {
  // TODO: DELETE FROM tasks WHERE id = ?
  // 用 [result] 拿到 affectedRows(影响了几行)
  // 返回 affectedRows > 0
    const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id])
    const affectedRows = (result as mysql.ResultSetHeader).affectedRows;
    return affectedRows > 0
}
