// ============================================================
// KafkaService —— 全局 Kafka 服务(对标 RabbitmqService)
// 封装 kafkajs,提供 Producer(发消息)和 Consumer(收消息)能力
// ============================================================
import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common"
import { Kafka, Producer, Consumer } from "kafkajs"

@Injectable()
export class KafkaService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name)
  private kafka: Kafka
  private producer: Producer

  // 初始化 Kafka 连接(在 AppModule.onModuleInit 调)
  async connect() {
    this.kafka = new Kafka({
      clientId: "study-node-app",
      brokers: [process.env.KAFKA_BROKER ?? "localhost:9092"],
    })
    this.producer = this.kafka.producer()
    await this.producer.connect()
    this.logger.log("✅ Kafka Producer 连接成功")
  }

  async onModuleDestroy() {
    await this.producer?.disconnect()
  }

  // 暴露 producer 给业务代码发消息
  getProducer(): Producer {
    return this.producer
  }

  // 暴露 kafka 实例,用来创建 Consumer
  getKafka(): Kafka {
    return this.kafka
  }
}
