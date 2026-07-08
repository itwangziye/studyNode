import type { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
    next()
}

export function notFound (req: Request, res: Response) {
    res.status(404).json({ error: `路径 ${req.url} 不存在` })
}