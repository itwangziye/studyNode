import { createServer } from "node:http";

interface Task {
    id: number
    title: string
    done: boolean
}

const tasks: Task[] = []          // 内存存储
let nextId = 1

const server = createServer((req, res) => {
    const method = req.method ?? "GET"
    const url = req.url ?? "/"

  if (method === "GET" && url === "/") {
    res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"})
    res.end("Task API 运行中")
    return   // ← 注意 return!不然会继续往下执行
  }
  if (method === "GET" && url === "/tasks") {
    // 返回所有任务
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" })
    res.end(JSON.stringify(tasks))
    return
  }

  if (method === "POST" && url === "/tasks") {
    // 读 body(见上面的固定套路),解析出 title,创建任务
    // TODO: 你来写这部分
    let body = ""
    req.on("data", (chunk: Buffer) => {        // 流式接收
        body += chunk.toString()
    })
    req.on("end", () => {   
         try {
            const data = JSON.parse(body)
            const newTask: Task = {
                id: nextId++,
                title: data.title,
                done: false,
            }
            tasks.push(newTask)
            res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" })
            res.end(JSON.stringify(newTask))
        } catch {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" })
            res.end(JSON.stringify({ error: "JSON 格式错误" }))
        }
    })
    return
  }

  // 都没匹配 → 404
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
  res.end("404 Not Found")
})

server.listen(3000, () => {
      console.log("🚀 服务器跑在 http://localhost:3000")
})