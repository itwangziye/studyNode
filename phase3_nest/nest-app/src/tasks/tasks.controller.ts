import { Controller, Get, Param, Post, Body, Delete, NotFoundException, BadRequestException, UseGuards } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";


@Controller("tasks")
export class TaskController {
    constructor(private readonly tasksService: TasksService) {}

    @Get()
    async findAll() {
        return await this.tasksService.findAll()
    }

    @Get(":id")
    async findOne(@Param("id")id: string) {
        const fId = Number(id);
        if (Number.isNaN(fId)) {
            throw new BadRequestException("ID不合法")
        }
        const task = await this.tasksService.findOne(fId);
        if (!task) throw new NotFoundException("任务不存在")
        return task
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: {title: string}) {
        if (!body.title) {
            return null
        }
        return await this.tasksService.create(body.title)
    }

    @Delete(":id") 
    @UseGuards(JwtAuthGuard)
    async delete(@Param("id") id: string) {
        const fid = Number(id);
        if (Number.isNaN(fid)) {
            return false
        }
        const success = await this.tasksService.remove(fid);
        if (success) {
            return true
        }
        return false
    }


} 

