import { Module } from "@nestjs/common";
import { TaskController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { TaskConsumer } from "./task.consumer";
import { SmsConsumer } from "./sms.consumer";
import { StatsConsumer } from "./stats.consumer";
import { KafkaConsumer } from "./kafka.consumer";



@Module({
    controllers: [TaskController],
    providers: [TasksService, TaskConsumer, SmsConsumer, StatsConsumer, KafkaConsumer]
})
export class TasksModule {}