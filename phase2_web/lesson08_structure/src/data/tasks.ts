export interface Task {
    id: number
    title: string
    done: boolean
}

const tasks: Task[] = []
let nextId = 1

export function getAllTask(): Task[] {
    return tasks
}

export function createTask(title: string): Task {
    const task = {id: nextId++, title, done: false}
    tasks.push(task)
    return task
}

export function getTaskById(id: number): Task | undefined {
  const task = tasks.find(item => item.id === id)
  return task
}

export function deleteTask(id: number): boolean {
    const taskIndex = tasks.findIndex(item => item.id === id)
    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1) 
        return true
    }
    return false
}