import type { Request, Response } from "express";
import { getAllTask, createTask, getTaskById, deleteTask } from "../data/tasks.ts";

export function index(req: Request, res: Response) {
    const tasks = getAllTask();
    res.json(tasks)
}

export function create(req: Request, res: Response) {
    const title = req.body?.title;
    if (!title) return res.status(400).json({error: 'title不能为空'})
    const task = createTask(title)
    res.status(201).json(task)
}

export function show(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({error: "id 必须是数字"})
    const task = getTaskById(id);
    if (task) {
        res.status(200).json(task)
    } else {
        res.status(404).json({error: '不存在任务'})
    }
}

export function destroy(req: Request, res: Response) {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) return res.status(400).json({error: "id 必须是数字"})
    const success = deleteTask(Number(id));
    if (success) {
        res.status(200).json({message: '删除成功'})
    } else {
        res.status(404).json({error: '该任务不存在'})
    }
}