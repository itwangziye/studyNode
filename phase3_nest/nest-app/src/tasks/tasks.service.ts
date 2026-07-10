import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) {}
                
    async findAll() {
        return await this.prisma.task.findMany();
    }
    async findOne(id: number) {
        return await this.prisma.task.findUnique({where: {id}})
    }
    async create(title: string, userId: number) {
        return await this.prisma.task.create({data: {title, userId}})
    }
    async remove(id: number) {
        const {count} = await this.prisma.task.deleteMany({ where: { id } })
        return count> 0
  }
}