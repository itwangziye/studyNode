import { Controller, Get, Param, Post, Body, Delete, NotFoundException, BadRequestException, UseGuards, ParseIntPipe } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";


@Controller("tasks")
export class TaskController {
    constructor(private readonly tasksService: TasksService) {}

    @Get()
    async findAll() {
        return await this.tasksService.findAll()
    }

    @Get(":id")
    async findOne(@Param("id", ParseIntPipe)id: number) {
        const task = await this.tasksService.findOne(id);
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
    @Roles("admin")
    @UseGuards(JwtAuthGuard, RolesGuard)
    async delete(@Param("id", ParseIntPipe) id: number) {
        const success = await this.tasksService.remove(id);
        if (success) {
            return true
        }
        return false
    }


} 

