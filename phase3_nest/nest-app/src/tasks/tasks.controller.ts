import { Controller, Get, Param, Post, Body, Delete, NotFoundException, BadRequestException, UseGuards, ParseIntPipe } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("任务")
@ApiBearerAuth()
@Controller("tasks")
export class TaskController {
    constructor(private readonly tasksService: TasksService) {}

    @Get()
    @ApiOperation({summary: "获取所有任务"})
    async findAll() {
        return await this.tasksService.findAll()
    }

    @Get(":id")
    @ApiOperation({summary: "查询任务"})
    async findOne(@Param("id", ParseIntPipe)id: number) {
        const task = await this.tasksService.findOne(id);
        if (!task) throw new NotFoundException("任务不存在")
        return task
    }

    @Post()
    @ApiOperation({summary: "创建任务"})
    @UseGuards(JwtAuthGuard)
    async create(
        @Body() body: {title: string},
        @CurrentUser() user: { userId: number, email: string, role?: string}
    ) {
        if (!body.title) {
            return null
        }
        return await this.tasksService.create(body.title, user.userId)
    }

    @Delete(":id") 
    @ApiOperation({summary: "删除任务"})
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

