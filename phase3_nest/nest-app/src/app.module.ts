import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { CommentModule } from './comment/comment.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { RequestContextModule } from './common/context/request-context.module';
import { LoggerModule } from './common/logger/logger.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MetricsModule } from './common/metrics/metrics.module';
import { HealthModule } from './common/health/health.module';


@Module({
  imports: [PrismaModule, RedisModule, LoggerModule, MetricsModule, HealthModule, RequestContextModule, ElasticsearchModule, RabbitmqModule, KafkaModule, TasksModule, AuthModule, ArticlesModule, CommentModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(RequestIdMiddleware)
    .forRoutes("*")
  }

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
