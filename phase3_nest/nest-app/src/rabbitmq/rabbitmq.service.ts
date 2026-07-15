// ============================================================
// RabbitmqService —— 全局 RabbitMQ 服务(对标 RedisService)
// 封装 amqplib,提供生产者(发消息)和消费者(收消息)能力
// ============================================================
import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common"
import * as amqp from "amqplib"

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name)
  // amqplib 2.x:connect() 返回 ChannelModel(不是老版本的 Connection)
  private connection: amqp.ChannelModel
  private channel: amqp.Channel

  // 模块启动时连接 RabbitMQ(NestJS 用 OnModuleInit 自动调)
  async connect() {
    this.connection = await amqp.connect({
      hostname: process.env.RABBITMQ_HOST ?? "localhost",
      port: Number(process.env.RABBITMQ_PORT ?? 5672),
      username: process.env.RABBITMQ_USER ?? "admin",
      password: process.env.RABBITMQ_PASS ?? "admin123",
    })
    this.channel = await this.connection.createChannel()
    this.logger.log("✅ RabbitMQ 连接成功")
  }

  async onModuleDestroy() {
    await this.channel?.close()
    await this.connection?.close()
  }

  // 暴露 channel 给业务代码用
  getChannel(): amqp.Channel {
    return this.channel
  }
}
