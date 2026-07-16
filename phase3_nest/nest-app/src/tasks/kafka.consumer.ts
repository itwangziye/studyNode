import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { KafkaService } from "../kafka/kafka.service";


@Injectable()
export class KafkaConsumer implements OnApplicationBootstrap {
    constructor(private readonly kafka: KafkaService) {}
    private readonly logger = new Logger(KafkaConsumer.name)

    async onApplicationBootstrap() {
        // 提示:
        // ① 创建 consumer:this.kafka.getKafka().consumer({ groupId: "stats-group" })
        // ② connect + subscribe(topic: "task-events", fromBeginning: true)
        // ③ consumer.run({ eachMessage: async ({ message }) => { ... } })
        //    message.value.toString() → JSON.parse → logger.log
        //    Kafka 不用 ack!
        const consumer = this.kafka.getKafka().consumer({ groupId: "stats-group"})

        await consumer.connect()

        await consumer.subscribe({topic: "task-events", fromBeginning: true})

        await consumer.run({ 
            eachMessage: async ( {message} ) => {
                const str = message.value?.toString()
                const data = str ? JSON.parse(str): null
                this.logger.log(`Kafka 收到消息：${JSON.stringify(data)}`)
            }
        })
        
    }
}