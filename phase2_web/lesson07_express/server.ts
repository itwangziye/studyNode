import express from 'express'

interface Task {
    id: number,
    title: string,
    done: boolean
}

const app = express();
const tasks: Task[] = []
let nextId = 1

app.use(express.json())

app.get('/', (req, res) => {
    res.send("Task API 运行中")
})

app.get('/tasks', (req, res) => {
    res.json(tasks)
})

app.post('/tasks', (req, res) => {
    const data = req.body
    if (!data?.title) return res.status(400).json({error: 'title不能为空'})
    const newTask: Task = {
        id: nextId++,
        title: data.title,
        done: false
    }
    tasks.push(newTask)
    res.status(201).json(newTask)
})



app.listen(3000, () => {
  console.log("🚀 Express 服务器跑在 http://localhost:3000")
})

