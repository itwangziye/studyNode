import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { KafkaModule } from './kafka/kafka.module';
import { KafkaService } from './kafka/kafka.service';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';


@Module({
  imports: [PrismaModule, RedisModule, RabbitmqModule, KafkaModule, TasksModule, AuthModule, ArticlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    private readonly rabbitmq: RabbitmqService,
    private readonly kafka: KafkaService,
  ) {}

  // NestJS 生命周期:onModuleInit 在所有模块初始化后自动调
  async onModuleInit() {
    await this.rabbitmq.connect()
    await this.kafka.connect()
  }
}
